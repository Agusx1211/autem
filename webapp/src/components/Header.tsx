
import React from 'react'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'

import { Container } from '@material-ui/core'
import { useHistory, useLocation, useParams } from 'react-router-dom'
import { useWeb3Context } from '../services/Web3'
import { shortAddress } from '../utils/address'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

const useStyles = makeStyles((theme) => ({
  head: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6)
  },
  container: {
    maxWidth: 660
  },
  headButtons: {
    marginTop: theme.spacing(4)
  }
}))


export default function Header() {
  const classes = useStyles()
  const history = useHistory()
  const location = useLocation()

  const { accounts, connected, disconnect, connect } = useWeb3Context()

  const onWeb3Click = async () => {
    if (connected) {
      if (disconnect) disconnect()
    } else {
      if (connect) connect()
    }
  }

  const isMain = location.pathname === '' || location.pathname === '/'

  const { addr } = useParams<{ addr: string }>()

  return (
    <div className={classes.head}>
      <Container className={classes.container}>
        <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
          Autem.eth
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          Minimal Ethereum dApp for creating and managing decentralized testamentary wills and trusts.
        </Typography>
        <div className={classes.headButtons}>
          <Grid container spacing={2} justify="center">
            <Grid item>
              { !isMain &&
                <Button onClick={() => history.push('/') } >
                  <ArrowBackIcon color="primary" />
                </Button>
              }
            </Grid>
            <Grid item>
              <Button onClick={() => history.push('/create') } variant="contained" color="primary">
                Create trust
              </Button>
            </Grid>
            <Grid item>
              <Button onClick={() => history.push(addr ? `/import/${addr}` : '/import') }variant="outlined" color="primary">
                Import trust
              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" color="primary" onClick={onWeb3Click}>
                { connected ? `Disconnect ${accounts && shortAddress(accounts[0])}` : 'Connect wallet' }
              </Button>
            </Grid>
          </Grid>
        </div>
      </Container>
  </div>
  )
}
