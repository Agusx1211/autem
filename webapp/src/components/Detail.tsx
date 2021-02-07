import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import { Collapse, Hidden, Snackbar, Typography } from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import { ethers } from 'ethers'
import { Autem__factory } from '../contracts'
import { useWeb3Context } from '../services/Web3'
import { useParams } from 'react-router-dom'
import pretty from 'pretty-ms'
import Interact from './Interact'
import { Alert } from '@material-ui/lab'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  table: {
    minWidth: 200,
  },
  tableMobile: {
    width: '100%'
  },
  address: {
    fontFamily: "'Roboto Mono', monospace"
  },
  addressMobile: {
    fontSize: "12px",
    fontFamily: "'Roboto Mono', monospace",
    padding: theme.spacing(1)
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  tableSkeleton: {
    marginLeft: 'auto'
  }
}))

export default function Detail() {
  const classes = useStyles()

  const [showAlert, setShowAlert] = React.useState(false)
  const [alertText, setAlertText] = React.useState('')

  const alert = (text: string) => {
    setAlertText(text)
    setShowAlert(true)
  }

  const closeAlert = () => {
    setShowAlert(false)
  }

  const { addr } = useParams<{ addr: string }>()
  const { provider, offlineProvider } = useWeb3Context()

  const [date, setDate] = useState(new Date())

  useEffect(() => {
   var timerID = setInterval( () => tick(), 1000 )
   return function cleanup() {
       clearInterval(timerID)
     }
  })

  function tick() {
    setDate(new Date());
  }

  const [state, setState] = useState<{
    owner: string,
    beneficiary: string,
    window: ethers.BigNumber,
    lastInteraction: ethers.BigNumber,
    name: string,
    description: string
  }>()

  useEffect(() => {
    const autem = Autem__factory.connect(addr, provider ? provider : offlineProvider)
    Promise.all([
      autem.owner(),
      autem.beneficiary(),
      autem.window(),
      autem.lastPing(),
      autem.metadata()
    ]).then((vals) => {
      const parsed = vals[4] === '' ? [''] : JSON.parse(vals[4])

      setState({
        owner: vals[0],
        beneficiary: vals[1],
        window: vals[2],
        lastInteraction: vals[3],
        name: parsed[0],
        description: parsed[1] ? parsed[1] : ''
      })
    }).catch((e) => {
      alert('404 Trust not found')
    })
  }, [provider, addr, offlineProvider])

  const releaseTimestamp = state?.lastInteraction.add(state?.window)
  const pending = releaseTimestamp?.sub(ethers.BigNumber.from(date.getTime()).div(1000))

  const shortTableSkeleton = <Skeleton className={classes.tableSkeleton} animation="wave" variant="text" width="55%" />
  const longTableSkeleton = <Skeleton className={classes.tableSkeleton} animation="wave" variant="text" />

  const nameComponent = (() => {
    if (state?.name === undefined) return <Skeleton animation="wave" variant="text" />
    if (state?.name === '') return "<No name>"
    return state.name
  })()

  const [pendingComponent, unlocked] = ((): [string | any, boolean] => {
    if (!pending) return [shortTableSkeleton, false]
    if (pending.lte(ethers.constants.Zero)) return ['Unlocked', true]
    return [pretty(pending.toNumber() * 1000 , { verbose: true, unitCount: 2 }), false]
  })()

  const windowComponent = (() => {
    if (!state?.window) return shortTableSkeleton
    return `${pretty(state.window.toNumber() * 1000, { verbose: true, unitCount: 2 })} (${state?.window.toString()} seconds)`
  })()

  const lastPingComponent = (() => {
    if (!state?.lastInteraction) return shortTableSkeleton
    return (new Date((state?.lastInteraction.toNumber() || 0) * 1000)).toLocaleString()
  })()

  const releaseDateComponent = (() => {
    if (!releaseTimestamp) return shortTableSkeleton
    return (new Date((releaseTimestamp.toNumber() || 0) * 1000)).toLocaleString()
  })()

  const ownerComponent = state?.owner ? state.owner : longTableSkeleton
  const beneficiaryComponent = state?.beneficiary ? state.beneficiary : longTableSkeleton

  return <>
    <div className={classes.root}>
      <Typography variant="h5" gutterBottom>
        {nameComponent}
      </Typography>
      <Collapse in={state?.description !== undefined && state?.description !== ""}>
        <Typography variant="body2" gutterBottom>
          {state?.description}
        </Typography>
      </Collapse>
      <br/>
      <Grid container spacing={3}>
        <Hidden xsDown> { /* Desktop table */ }
          <Grid item md={7} sm={12} xs>
            <TableContainer component={Paper}>
              <Table className={classes.table} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell align="right">Value</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Trust
                    </TableCell>
                    <TableCell align="right" className={classes.address}>
                        {addr}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Owner
                    </TableCell>
                    <TableCell align="right" className={classes.address}>
                      { ownerComponent }
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Beneficiary
                    </TableCell>
                    <TableCell align="right" className={classes.address}>
                      { beneficiaryComponent }
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Window
                    </TableCell>
                    <TableCell align="right">
                      {windowComponent}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Last interaction
                    </TableCell>
                    <TableCell align="right">
                      {lastPingComponent}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Unlock date
                    </TableCell>
                    <TableCell align="right">
                      {releaseDateComponent}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row">
                      Unlocks in
                    </TableCell>
                    <TableCell align="right">{pendingComponent}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Hidden>
        <Hidden smUp> { /* Desktop table */ }
          <Grid item md={7} sm={12} className={classes.tableMobile}>
            <TableContainer component={Paper}>
              <Table aria-label="simple table">
                <TableRow>
                  <TableCell>
                    Trust
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.addressMobile} component="th" scope="row">
                    {addr}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Owner
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.addressMobile} component="th" scope="row">
                    {ownerComponent}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Beneficiary
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.addressMobile} component="th" scope="row">
                    {beneficiaryComponent}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Window
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.addressMobile} component="th" scope="row">
                    {windowComponent}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Last interaction
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.addressMobile} component="th" scope="row">
                    {lastPingComponent}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Unlock date
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.addressMobile} component="th" scope="row">
                    {releaseDateComponent}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    Unlocks in
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={classes.addressMobile} component="th" scope="row">
                    {pendingComponent}
                  </TableCell>
                </TableRow>
              </Table>
            </TableContainer>
          </Grid>
        </Hidden>
        <Interact trust={addr} owner={state?.owner} beneficiary={state?.beneficiary} unlocked={unlocked} />
      </Grid>
      <Snackbar open={showAlert} onClose={closeAlert}>
          <Alert onClose={closeAlert} severity="error">
            {alertText}
          </Alert>
      </Snackbar>
    </div>
  </>
}
