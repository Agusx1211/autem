import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import { makeStyles } from '@material-ui/core/styles'
import { Backdrop, CircularProgress, Collapse, Snackbar, Typography } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import parse from '../utils/parse'

import pretty from 'pretty-ms'
import { ethers } from 'ethers'
import { chainInfo, FACTORY_ADDRESS, useWeb3Context } from '../services/Web3'
import { Factory__factory } from '../contracts/factories/Factory__factory'
import { addressOf, getAddressHelper, solveAddress, SolvedAddressType } from '../utils/address'
import { useTrustsContext } from '../services/Trusts'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
  paper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '50%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
    backgroundColor: "rgba(0, 0, 0, 0.75)"
  },
  backdropText: {
    margin: theme.spacing(3, 0, 2),
    paddingLeft: "12px"
  }
}))

export default function SignIn() {
  const classes = useStyles()

  const { connected, provider, connect, accounts, readProvider, chainId } = useWeb3Context()

  const [inputDelay, setInputDelay] = useState('')

  const [owner, setOwner] = useState('')
  const [beneficiary, setBeneficiary] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const [warranty, setWarranty] = useState(false)
  const [alpha, setAlpha] = useState(false)

  const history = useHistory()

  const [solvedOwner, setSolvedOwner] = useState<SolvedAddressType>()
  const [solvedBeneficiary, setSolvedBeneficiary] = useState<SolvedAddressType>()

  useEffect(() => {
    let running = true
    solveAddress(owner, readProvider).then((r) => running && setSolvedOwner(r))
    return () => { running = false }
  }, [owner, readProvider])

  useEffect(() => {
    let running = true
    solveAddress(beneficiary, readProvider).then((r) => running && setSolvedBeneficiary(r))
    return () => { running = false }
  }, [beneficiary, readProvider])

  const [ownerError, ownerHelperText] = getAddressHelper(owner, solvedOwner)
  const [beneficiaryError, beneficiaryHelperText] = getAddressHelper(beneficiary, solvedBeneficiary)

  const parsed = parse(inputDelay)

  const { addTrust, addKnownInitialParameters } = useTrustsContext()

  const [openBackdrop, setOpenBackdrop] = React.useState(false)

  const [showAlert, setShowAlert] = React.useState(false)
  const [alertText, setAlertText] = React.useState('')

  const alert = (text: string) => {
    setAlertText(text)
    setShowAlert(true)
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  const create = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!solvedOwner?.isValid) return alert('Owner is not a valid address')
    if (!solvedBeneficiary?.isValid) return alert('Beneficiary is not a valid address')
    if (!parsed) return alert('Invalid parsed activation delay')

    if (!warranty || !alpha) return alert('Rejected terms and conditions')

    if (!connected || provider === undefined || !accounts) {
      if (connect) connect()
      return alert('Not connected to wallet')
    }

    if (!chainInfo(chainId).supported) return alert('Network not supported')

    const metadata = description === '' ? name === '' ? '' : JSON.stringify([name]) : JSON.stringify([name, description])

    const initialParameters = { owner: solvedOwner.address, beneficiary: solvedBeneficiary.address, window: ethers.BigNumber.from(parsed).div(1000), metadata }
    const address = addressOf(initialParameters)

    const tx = await Factory__factory.connect(FACTORY_ADDRESS, provider.getSigner(accounts[0])).create(
      initialParameters.owner,
      initialParameters.beneficiary,
      initialParameters.window,
      initialParameters.metadata
    )

    setOpenBackdrop(true)

    addTrust && addTrust(address)
    addKnownInitialParameters && addKnownInitialParameters(initialParameters)
    await tx.wait(1)

    history.push(`/trust/${address}`)
    setOpenBackdrop(false)
  }

  return (
    <div className={classes.paper}>
      <Typography component="h1" variant="h4">
        Create trust
      </Typography>
      <form className={classes.form} onSubmit={create} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="owner"
          label="Owner"
          name="owner"
          autoComplete="owner"
          autoFocus
          value={owner}
          placeholder="Ethereum Address (0x...) or ENS name"
          onChange={(e) => { setOwner(e.target.value); setSolvedOwner(undefined) } }
          error={ownerError}
          helperText={ownerHelperText}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="beneficiary"
          label="Beneficiary"
          type="beneficiary"
          id="beneficiary"
          value={beneficiary}
          placeholder="Ethereum Address (0x...) or ENS name"
          onChange={(e) => { setBeneficiary(e.target.value); setSolvedBeneficiary(undefined) } }
          error={beneficiaryError}
          helperText={beneficiaryHelperText}
        />
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          name="duration"
          label="Activation delay"
          type="duration"
          id="duration"
          placeholder="2 years, 6 months"
          helperText={parsed ? pretty(parsed, { verbose: true }) : inputDelay !== "" ? "Error parsing duration, E.g. '2 years'" : ""}
          error={parsed === null && inputDelay !== ""}
          onChange={(e) => setInputDelay(e.target.value) }
        />
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
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value) }
        />
        <Collapse in={name !== "" || description !== ""}>
          <Alert severity="warning">
            Name and description becomes publicly accessible information on the blockchain and <b>can't be un-published</b>, use with care.
          </Alert>
          <br/>
        </Collapse>
        <FormControlLabel
          control={<Checkbox value="warranty" color="primary" onChange={(event) => setWarranty(event.target.checked)} />}
          label='I understand Autem.eth software is provided "as is", without warranty of any kind, express or implied.'
        />
        <FormControlLabel
          control={<Checkbox value="alpha" color="primary" onChange={(event) => { setAlpha(event.target.checked) }} />}
          label='I understand Autem.eth software is alpha software that may contain bugs that could lead to loss of funds.'
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
        >
          Create
        </Button>
        <Snackbar open={showAlert} autoHideDuration={6000} onClose={closeAlert}>
          <Alert onClose={closeAlert} severity="error">
            {alertText}
          </Alert>
        </Snackbar>
      </form>
      <Backdrop className={classes.backdrop} open={openBackdrop}>
        <CircularProgress color="inherit" />
        <Typography className={classes.backdropText} variant="h4">
          Creating trust
        </Typography>
      </Backdrop>
    </div>
  )
}
