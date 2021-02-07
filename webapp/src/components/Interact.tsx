import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import { Button, Link, MenuItem, Select, Snackbar, TextField, Typography } from '@material-ui/core'
import { ethers } from 'ethers'
import { Alert, AlertProps } from '@material-ui/lab'
import { AuthLevel, canSend, isBignumberish } from '../utils'
import { useWeb3Context } from '../services/Web3'
import { Autem__factory } from '../contracts'
import pretty from 'pretty-ms'
import parse from '../utils/parse'
import { EXPLORER_TX } from '../utils/constants'
import copy from 'copy-to-clipboard'
import { Route, useHistory } from 'react-router-dom'
import { useTrustsContext } from '../services/Trusts'
import { getAddressHelper, solveAddress, SolvedAddressType } from '../utils/address'

var QRCode = require('qrcode.react')

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  qr: {
    margin: theme.spacing(4)
  },
  alert: {
    textDecoration: 'underline'
  }
}))

function QrCodeForm(props: { addr: string }) {
  const classes = useStyles()

  const [showAlert, setShowAlert] = useState(false)
  const [alertText, setAlertText] = useState<any>('')

  const alert = (text: string) => {
    setAlertText(text)
    setShowAlert(true)
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  return <>
    <Grid container justify="center">
      <QRCode className={classes.qr} value={props.addr} level='H' size={186} />
      <Typography variant="caption">
        Trust address:<br/>{ethers.utils.getAddress(props.addr)}
      </Typography>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
        onClick={() => { copy(props.addr); alert('Copied to clipboard!') } }
      >
        Copy to clipboard
      </Button>
      <Snackbar open={showAlert} autoHideDuration={6000} onClose={closeAlert}>
        <Alert onClose={closeAlert} severity='info'>
          {alertText}
        </Alert>
      </Snackbar>
    </Grid>
  </>
}

function SetMetadataForm(props: { trust: string, owner?: string, beneficiary?: string, unlocked: boolean }) {
  const classes = useStyles()

  const { connected, provider, connect, accounts } = useWeb3Context()

  const [showAlert, setShowAlert] = useState(false)
  const [alertText, setAlertText] = useState<any>('')
  const [severity, setSeverity] = useState<AlertProps["severity"]>('error')

  const alert = (text: string) => {
    setSeverity('error')
    setAlertText(text)
    setShowAlert(true)
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const send = async () => {
    try {
      if (!connected || provider === undefined || !accounts) {
        if (connect) connect()
        return alert('Not connected to wallet')
      }

      switch (canSend({ ...props, account: accounts[0] })) {
        case AuthLevel.LOCKED:
          return alert('Trust is locked')

        case AuthLevel.UNAUTHORIZED:
          return alert('Not authorized')
      }

      const metadata = description === '' ? name === '' ? '' : JSON.stringify([name]) : JSON.stringify([name, description])
      const tx = await Autem__factory.connect(props.trust, provider.getSigner(accounts[0])).setMetadata(metadata)

      // Show transaction sent
      setSeverity('info')
      setAlertText(<>Transaction sent <Link className={classes.alert} rel="noopener noreferrer" target="_blank" href={`${EXPLORER_TX}${tx.hash}`} color="inherit">{tx.hash}</Link></>)
      setShowAlert(true)

      // Reset form
      setName(''); setDescription('')
    } catch (e) {
      alert(e.message)
    }
  }

  return <>
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      name="name"
      label="Public name (optional)"
      type="name"
      id="name"
      value={name}
      onChange={(e) => setName(e.target.value) }
    />
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      name="description"
      label="Public description (optional)"
      type="description"
      id="description"
      multiline
      rows={3}
      value={description}
      onChange={(e) => setDescription(e.target.value) }
    />
    <Alert severity="warning">
      Name and description becomes publicly accessible information on the blockchain and <b>can't be un-published</b>, use with care.
    </Alert>
    <Button
      type="submit"
      fullWidth
      variant="contained"
      color="primary"
      className={classes.submit}
      onClick={send}
    >
      Set Metadata
    </Button>
    <Snackbar open={showAlert} autoHideDuration={6000} onClose={closeAlert}>
      <Alert onClose={closeAlert} severity={severity}>
        {alertText}
      </Alert>
    </Snackbar>
  </>
}

function SendTransactionForm(props: { trust: string, owner?: string, beneficiary?: string, unlocked: boolean }) {
  const classes = useStyles()

  const { connected, provider, connect, accounts, readProvider } = useWeb3Context()

  const [showAlert, setShowAlert] = useState(false)
  const [alertText, setAlertText] = useState<any>('')
  const [severity, setSeverity] = useState<AlertProps["severity"]>('error')

  const alert = (text: string) => {
    setSeverity('error')
    setAlertText(text)
    setShowAlert(true)
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  const [to, setTo] = useState('')
  const [value, setValue] = useState('')
  const [data, setData] = useState('')

  const [solvedTo, setSolvedTo] = useState<SolvedAddressType>()

  useEffect(() => {
    let running = true
    solveAddress(to, readProvider).then((r) => running && setSolvedTo(r))
    return () => { running = false }
  }, [to, readProvider])

  const [toError, toHelperText] = getAddressHelper(to, solvedTo)

  const valueError = value === '' || isBignumberish(value) ? '' : 'Invalid amount'
  const dataError = data === '' || ethers.utils.isBytesLike(data) ? '' : 'Invalid data'

  const parsedValue = valueError === '' ? `Sending ${ethers.utils.formatEther(ethers.BigNumber.from(value === '' ? 0 : value))} ETH` : ''

  const send = async () => {
    try {
      if (!ethers.utils.isAddress(to)) return alert('Invalid address')
      if (!isBignumberish(value)) return alert('Invalid amount')
      if (dataError !== '') return alert('Invalid data')

      if (!connected || provider === undefined || !accounts) {
        if (connect) connect()
        return alert('Not connected to wallet')
      }

      switch (canSend({ ...props, account: accounts[0] })) {
        case AuthLevel.LOCKED:
          return alert('Trust is locked')
        
        case AuthLevel.UNAUTHORIZED:
          return alert('Not authorized')
      }

      const tx = await Autem__factory.connect(props.trust, provider.getSigner(accounts[0])).execute(to, ethers.BigNumber.from(value === '' ? 0 : value), data === '' ? [] : data)

      // Show transaction sent
      setSeverity('info')
      setAlertText(<>Transaction sent <Link className={classes.alert} rel="noopener noreferrer" target="_blank" href={`${EXPLORER_TX}${tx.hash}`} color="inherit">{tx.hash}</Link></>)
      setShowAlert(true)

      // Reset form
      setTo(''); setValue(''); setData('');
      setSolvedTo(undefined)
    } catch (e) {
      alert(e.message)
    }
  }

  return <>
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id="to"
      label="Recipient"
      name="to"
      autoComplete="to"
      autoFocus
      value={to}
      onChange={(e) => { setTo(e.target.value); setSolvedTo(undefined) }}
      error={toError}
      helperText={toHelperText}
    />
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      name="value"
      label="Value"
      id="value"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      error={valueError !== ''}
      helperText={valueError !== '' ? valueError : parsedValue}
    />
    <TextField
      variant="outlined"
      margin="normal"
      fullWidth
      name="data"
      label="Data (optional)"
      id="data"
      multiline
      rows={2}
      value={data}
      onChange={(e) => setData(e.target.value)}
      error={dataError !== ''}
      helperText={dataError}
    />
    <Button
      type="submit"
      fullWidth
      variant="contained"
      color="primary"
      className={classes.submit}
      onClick={send}
    >
      Send transaction
    </Button>
    <Snackbar open={showAlert} autoHideDuration={6000} onClose={closeAlert}>
      <Alert onClose={closeAlert} severity={severity}>
        {alertText}
      </Alert>
    </Snackbar>
  </>
}

function ChangeParamForm(props: { trust: string, owner?: string, beneficiary?: string, unlocked: boolean, mode: number }) {
  const classes = useStyles()

  const { mode } = props

  const [showAlert, setShowAlert] = useState(false)
  const [alertText, setAlertText] = useState<any>('')
  const [severity, setSeverity] = useState<AlertProps["severity"]>('error')

  const { connected, provider, connect, accounts, readProvider } = useWeb3Context()

  const [address, setAddress] = useState('')
  const [solvedAddress, setSolvedAddress] = useState<SolvedAddressType>()

  useEffect(() => {
    let running = true
    solveAddress(address, readProvider).then((r) => running && setSolvedAddress(r))
    return () => { running = false }
  }, [address, readProvider])

  const [addressError, addressHelperText] = getAddressHelper(address, solvedAddress)

  const alert = (text: string) => {
    setSeverity('error')
    setAlertText(text)
    setShowAlert(true)
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  useEffect(() => {
    setAddress('')
    setSolvedAddress(undefined)
  }, [mode])


  const action = mode === 3 ? 'Owner' :  mode === 4 ? 'Beneficiary' : 'Window'

  const send = async () => {
    try {
      if (!solvedAddress?.address) return alert('Invalid address')

      if (!connected || provider === undefined || !accounts) {
        if (connect) connect()
        return alert('Not connected to wallet')
      }

      switch (canSend({ ...props, account: accounts[0] })) {
        case AuthLevel.LOCKED:
          return alert('Trust is locked')
        
        case AuthLevel.UNAUTHORIZED:
          return alert('Not authorized')
      }

      const autem = Autem__factory.connect(props.trust, provider.getSigner(accounts[0]))
      const tx = await (() => { switch (mode) {
        case 3:
          return autem.setOwner(solvedAddress.address)
        case 4:
          return autem.setBeneficiary(solvedAddress.address)
      }})() as ethers.ContractTransaction

      // Show transaction sent
      setSeverity('info')
      setAlertText(<>Transaction sent <Link className={classes.alert} rel="noopener noreferrer" target="_blank" href={`${EXPLORER_TX}${tx.hash}`} color="inherit">{tx.hash}</Link></>)
      setShowAlert(true)

      setAddress('')
      setSolvedAddress(undefined)
    } catch (e) {
      alert(e.message)
    }
  }

  return <>
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id="new"
      label={`New ${action}`}
      name="new"
      autoComplete="new"
      autoFocus
      value={address}
      onChange={(e) => { setAddress(e.target.value); setSolvedAddress(undefined) }}
      error={addressError}
      helperText={addressHelperText}
    />
    <Button
      type="submit"
      fullWidth
      variant="contained"
      color="primary"
      className={classes.submit}
      onClick={send}
    >
      Set {action}
    </Button>
    <Snackbar open={showAlert} autoHideDuration={6000} onClose={closeAlert}>
      <Alert onClose={closeAlert} severity={severity}>
        {alertText}
      </Alert>
    </Snackbar>
  </>
}

function ChangeWindowForm(props: { trust: string, owner?: string, beneficiary?: string, unlocked: boolean }) {
  const classes = useStyles()

  const [value, setValue] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertText, setAlertText] = useState<any>('')
  const [severity, setSeverity] = useState<AlertProps["severity"]>('error')

  const { connected, provider, connect, accounts } = useWeb3Context()

  const alert = (text: string) => {
    setSeverity('error')
    setAlertText(text)
    setShowAlert(true)
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  const parsed = parse(value)
  const error = value === '' || parsed ? false : true
  const helpText = !error ? !parsed ? '' : pretty(parsed, { verbose: true }) : 'Error parsing duration, E.g. \'2 years\''

  const send = async () => {
    try {
      if (!parsed) return alert('Invalid number')

      if (!connected || provider === undefined || !accounts) {
        if (connect) connect()
        return alert('Not connected to wallet')
      }

      switch (canSend({ ...props, account: accounts[0] })) {
        case AuthLevel.LOCKED:
          return alert('Trust is locked')
        
        case AuthLevel.UNAUTHORIZED:
          return alert('Not authorized')
      }

      const autem = Autem__factory.connect(props.trust, provider.getSigner(accounts[0]))
      const tx = await autem.setWindow(ethers.BigNumber.from(parse(value)).div(1000))

      // Show transaction sent
      setSeverity('info')
      setAlertText(<>Transaction sent <Link className={classes.alert} rel="noopener noreferrer" target="_blank" href={`${EXPLORER_TX}${tx.hash}`} color="inherit">{tx.hash}</Link></>)
      setShowAlert(true)

      setValue('')
    } catch (e) {
      alert(e.message)
    }
  }

  return <>
    <TextField
      variant="outlined"
      margin="normal"
      required
      fullWidth
      id="new"
      label={`New Window`}
      name="new"
      autoComplete="new"
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      error={error}
      helperText={helpText}
    />
    <Button
      type="submit"
      fullWidth
      variant="contained"
      color="primary"
      className={classes.submit}
      onClick={send}
    >
      Set Window
    </Button>
    <Snackbar open={showAlert} autoHideDuration={6000} onClose={closeAlert}>
      <Alert onClose={closeAlert} severity={severity}>
        {alertText}
      </Alert>
    </Snackbar>
  </>
}

function HideTrust(props: { trust: string }) {
  const classes = useStyles()

  const history = useHistory()
  const { removeTrust, hideTrust } = useTrustsContext()

  const send = async () => {
    removeTrust && removeTrust(props.trust)
    hideTrust && hideTrust(props.trust)
    history.push('/')
  }

  return <>
    <br/>
    <br/>
    <Alert severity={'warning'}>
      Trusts are permanent contracts on the Ethereum blockchain that can't be deleted, this action will hide this trust in your browser interface.
    </Alert>
    <Button
      type="submit"
      fullWidth
      variant="contained"
      color="primary"
      className={classes.submit}
      onClick={send}
    >
      Remove trust
    </Button>
  </>
}

function RenewTimerForm(props: { trust: string, owner?: string, beneficiary?: string, unlocked: boolean }) {
  const classes = useStyles()

  const [showAlert, setShowAlert] = useState(false)
  const [alertText, setAlertText] = useState<any>('')
  const [severity, setSeverity] = useState<AlertProps["severity"]>('error')

  const { connected, provider, connect, accounts } = useWeb3Context()

  const alert = (text: string) => {
    setSeverity('error')
    setAlertText(text)
    setShowAlert(true)
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  const send = async () => {
    try {
      if (!connected || provider === undefined || !accounts) {
        if (connect) connect()
        return alert('Not connected to wallet')
      }

      if (props.owner !== accounts[0]) return alert('Not authorized')

      const autem = Autem__factory.connect(props.trust, provider.getSigner(accounts[0]))
      const tx = await autem.execute(props.trust, ethers.constants.Zero, [])

      // Show transaction sent
      setSeverity('info')
      setAlertText(<>Transaction sent <Link className={classes.alert} rel="noopener noreferrer" target="_blank" href={`${EXPLORER_TX}${tx.hash}`} color="inherit">{tx.hash}</Link></>)
      setShowAlert(true)
    } catch (e) {
      alert(e.message)
    }
  }

  return <>
    <br/>
    <br/>
    <Alert severity='info'>
      Resets the unlock countdown of the dead-man switch to the current window.
    </Alert>
    <Button
      type="submit"
      fullWidth
      variant="contained"
      color="primary"
      className={classes.submit}
      onClick={send}
    >
      Rewew timer
    </Button>
    <Snackbar open={showAlert} autoHideDuration={6000} onClose={closeAlert}>
      <Alert onClose={closeAlert} severity={severity}>
        {alertText}
      </Alert>
    </Snackbar>
  </>
}

export default function Interact(props: { trust: string, owner?: string, beneficiary?: string, unlocked: boolean }) {
  const { trust } = props
  const classes = useStyles()
  const history = useHistory()

  const path = (sub: string) => `/trust/${trust}/${sub}`

  const [mode, setMode] = useState(`/trust/${trust}`)

  return <Grid item md={5} sm={12}>
    <div className={classes.paper}>
      <Typography component="h1" variant="h5" gutterBottom>
        Interact with trust
      </Typography>
      <div className={classes.form}>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          variant="outlined"
          required
          fullWidth
          value={mode}
          onChange={(e) => { setMode(e.target.value as string); history.push(e.target.value as string) }}
        >
          <MenuItem value={`/trust/${trust}`}>Deposit Funds</MenuItem>
          <MenuItem value={path('renew')}>Renew timer (ping)</MenuItem>
          <MenuItem value={path('send')}>Withdraw funds</MenuItem>
          {/* <MenuItem value={2}>Send ERC20 token</MenuItem> */}
          <MenuItem value={path('set-owner')}>Change owner</MenuItem>
          <MenuItem value={path('set-beneficiary')}>Change beneficiary</MenuItem>
          <MenuItem value={path('set-window')}>Change window</MenuItem>
          <MenuItem value={path('set-metadata')}>Change metadata</MenuItem>
          <MenuItem value={path('hide')}>Remove trust</MenuItem>
        </Select>
        <Route exact path="/trust/:addr">
          <QrCodeForm addr={props.trust} />
        </Route>
        <Route path="/trust/:addr/send">
          <SendTransactionForm { ...props } />
        </Route>
        <Route path="/trust/:addr/set-owner">
          <ChangeParamForm { ...props } mode={3} />
        </Route>
        <Route path="/trust/:addr/set-beneficiary">
          <ChangeParamForm { ...props } mode={4} />
        </Route>
        <Route path="/trust/:addr/set-window">
          <ChangeWindowForm {...props} />
        </Route>
        <Route path="/trust/:addr/set-metadata">
          <SetMetadataForm {...props} />
        </Route>
        <Route path="/trust/:addr/hide">
          <HideTrust {...props} />
        </Route>
        <Route path="/trust/:addr/renew">
          <RenewTimerForm {...props} />
        </Route>
      </div>
    </div>
  </Grid>
}
