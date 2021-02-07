import React, { useEffect, useState } from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'
import { Backdrop, CircularProgress, Snackbar, Typography } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import { ethers } from 'ethers'
import { chainInfo, useWeb3Context } from '../services/Web3'
import { useTrustsContext } from '../services/Trusts'
import { useHistory, useParams } from 'react-router-dom'
import { Autem__factory } from '../contracts'
import { getAddressHelper, solveAddress, SolvedAddressType } from '../utils/address'

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

export default function Import() {
  const classes = useStyles()

  const { readProvider, chainId } = useWeb3Context()

  const { addr } = useParams<{ addr: string }>()

  const [trust, setTrust] = useState(addr ? addr : '')
  const [solvedTrust, setSolvedTrust] = useState<SolvedAddressType>()

  useEffect(() => {
    let running = true
    solveAddress(trust, readProvider).then((r) => running && setSolvedTrust(r))
    return () => { running = false }
  }, [trust, readProvider])

  const [trustError, trustHelperText] = getAddressHelper(trust, solvedTrust)

  const history = useHistory()

  const { provider, offlineProvider } = useWeb3Context()
  const { addTrust, hasTrust, removeHideTrust } = useTrustsContext()

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

    if (!solvedTrust?.isValid) return alert('Trust is not a valid address')
    if (hasTrust && hasTrust(trust)) return alert('Trust already exist')
    if (!chainInfo(chainId).supported) return alert('Network not supported')

    try {
      setOpenBackdrop(true)
      const autem = Autem__factory.connect(solvedTrust.address, provider ? provider : offlineProvider)
      const trustOwner = await autem.owner()
      setOpenBackdrop(false)

      if (trustOwner === ethers.constants.AddressZero) return alert('Trust not found')

      addTrust && addTrust(trust)
      removeHideTrust && removeHideTrust(trust)

      history.push(`/trust/${trust}`)
    } catch (e) {
      setOpenBackdrop(false)
      alert('Trust not found')
    }
  }

  return (
    <div className={classes.paper}>
      <Typography component="h1" variant="h4">
        Import trust
      </Typography>
      <form className={classes.form} onSubmit={create} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          required
          fullWidth
          id="trust"
          label="Trust address"
          name="trust"
          autoComplete="trust"
          autoFocus
          value={trust}
          onChange={(e) => { setTrust(e.target.value); setSolvedTrust(undefined) } }
          error={trustError}
          helperText={trustHelperText}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          color="primary"
          className={classes.submit}
        >
          Import
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
          Importing trust
        </Typography>
      </Backdrop>
    </div>
  )
}
