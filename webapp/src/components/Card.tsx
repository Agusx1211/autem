
import Button from '@material-ui/core/Button'
import { Card as MaterialCard, makeStyles } from '@material-ui/core'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import { shortAddress } from '../utils/address'
import { useHistory } from 'react-router-dom'
import { EXPLORER_ADDR } from '../utils/constants'
import { Autem__factory } from '../contracts'
import { useWeb3Context } from '../services/Web3'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import Skeleton from '@material-ui/lab/Skeleton'
import pretty from 'pretty-ms'

const useStyles = makeStyles(() => ({
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardContent: {
    flexGrow: 1,
  },
  address: {
    fontFamily: "'Roboto Mono', monospace"
  }
}))

export default function Card(props: { trust: string }) {
  const classes = useStyles()

  const history = useHistory()

  const { provider, offlineProvider } = useWeb3Context()

  const trust = props.trust

  const [state, setState] = useState<{
    owner: string,
    beneficiary: string,
    window: ethers.BigNumber,
    lastInteraction: ethers.BigNumber,
    name: string,
    description: string
  }>()

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

  useEffect(() => {
    const autem = Autem__factory.connect(trust, provider ? provider : offlineProvider)

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
    }).catch(() => {})
  }, [provider, trust, offlineProvider])

  const releaseTimestamp = state?.lastInteraction.add(state?.window)
  const pending = releaseTimestamp?.sub(ethers.BigNumber.from(date.getTime()).div(1000))

  const nameComponent = (() => {
    if (state?.name === undefined) return <Skeleton animation="wave" variant="text" />
    if (state?.name === '') return "<No name>"
    return state.name
  })()

  const pendingComponent = (() => {
    if (!pending) return <Skeleton animation="wave" variant="text" width="55%" />
    if (pending.lte(ethers.constants.Zero)) return 'Unlocked'
    return pretty(pending.toNumber() * 1000 , { verbose: true, unitCount: 2 })
  })()

  return <MaterialCard className={classes.card}>
    <CardContent className={classes.cardContent}>
      <Typography variant="h5">
        {nameComponent}
      </Typography>
      <Typography className={classes.address}>
        {shortAddress(trust, 5)}
      </Typography>
      <br/>
      <Typography variant="caption" display="block" >
        Owner
      </Typography>
      <Typography className={classes.address}>
        {state?.owner ? shortAddress(state.owner, 5) : <Skeleton animation="wave" variant="text" width="55%" />}
      </Typography>
      <br/>
      <Typography variant="caption" display="block" >
        Beneficiary
      </Typography>
      <Typography className={classes.address}>
        {state?.beneficiary ? shortAddress(state.owner, 5) : <Skeleton animation="wave" variant="text" width="55%" />}
      </Typography>
      <br/>
      <Typography variant="caption" display="block" >
        Unlocks in
      </Typography>
      <Typography>
        {pendingComponent}
      </Typography>
    </CardContent>
    <CardActions>
      <Button size="small" onClick={() => history.push(`/trust/${trust}`)} color="primary">
        Open
      </Button>
      <Button size="small" target="_blank" rel="noopener noreferrer" href={`${EXPLORER_ADDR}${trust}`} color="primary">
        View
      </Button>
    </CardActions>
  </MaterialCard>
}
