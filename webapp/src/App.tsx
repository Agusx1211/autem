
import React from 'react'
import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import { createMuiTheme, makeStyles, ThemeProvider } from '@material-ui/core/styles'
import Main from './components/Main'
import { Container, Grid, Link } from '@material-ui/core'

import {
  Switch,
  Route,
  useHistory,
  HashRouter
} from "react-router-dom"
import Detail from './components/Detail'
import Create from './components/Create'
import Header from './components/Header'

import Web3Provider, { chainInfo, DEFAULT_NETWORK, FACTORY_ADDRESS, useWeb3Context } from './services/Web3'
import TrustsProvider from './services/Trusts'
import Import from './components/Import'

import { EXPLORER_ADDR } from './utils/constants'

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'GNU General Public License © '}
      <Link target="_blank" rel="noopener noreferrer" color="inherit" href="https://#">
        Autem
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#ff4400',
    },
    secondary: {
      light: '#0066ff',
      main: '#0044ff',
      contrastText: '#ffcc00',
    },
    contrastThreshold: 3,
    tonalOffset: 0.2,
  },
})

const useStyles = makeStyles((theme) => ({
  content: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6),
  },
  unsuported: {
    color: 'red'
  },
  link: {
    textDecoration: 'underline',
    color: 'gray'
  }
}))


function Footer() {
  const classes = useStyles()

  const { connected, chainId } = useWeb3Context()
  const netInfo = connected ? chainInfo(chainId) : undefined

  const format = (str: any) => <Typography variant="subtitle2" align="center" color="textSecondary">{str}</Typography>

  const networkObject = (() => {
    if (!netInfo) return format(`Network: ${chainInfo(DEFAULT_NETWORK).name}`)
    if (!netInfo.supported) return <Typography variant="subtitle2" align="center" className={classes.unsuported}>Network: {netInfo.name} (Not supported)</Typography>
    return format(`Network: ${netInfo.name}`)
  })()

  return <footer className={classes.footer}>
    <Typography variant="h6" align="center" gutterBottom>
      by <Link color="inherit" target="_blank" rel="noopener noreferrer" href="https://twitter.com/agusx1211">@Agusx1211</Link>
    </Typography>
    <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
      The software is provided "as is", without warranty of any kind, express or implied.
    </Typography>
    <Copyright />
    <br/>
    <Grid container spacing={2} justify="center">
      <Grid item>{format(<Link color="inherit" target="_blank" rel="noopener noreferrer" href="https://#">Github</Link>)}</Grid>
      <Grid item>{format(<Link color="inherit" target="_blank" rel="noopener noreferrer" href={`${EXPLORER_ADDR}${FACTORY_ADDRESS}`}>Contract</Link>)}</Grid>
      <Grid item>{format(<Link color="inherit" target="_blank" rel="noopener noreferrer" href={`${EXPLORER_ADDR}0x3D1A6e00577e2130A20809f14f0FAaC7F5485860`}>Donate</Link>)}</Grid>
      <Grid item>{networkObject}</Grid>
    </Grid>
    <br/>
  </footer>
}

export default function App() {
  const classes = useStyles()

  let history = useHistory()

  return (
    <React.Fragment>
      <HashRouter>
        <Web3Provider>
          <TrustsProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Switch>
                <Route exact path="/trust/:addr"> 
                  <Header />
                </Route>
                <Route path="/"> 
                  <Header />
                </Route>
              </Switch>
              <Container className={classes.content} maxWidth="md">
                <Switch>
                  <Route exact path="/"> 
                    <Main/>
                  </Route>
                  <Route path="/trust/:addr"> 
                    <Detail/>
                  </Route>
                  <Route path="/create"> 
                    <Create/>
                  </Route>
                  <Route path="/import/:addr?"> 
                    <Import/>
                  </Route>
                </Switch>
              </Container>
              <Footer />
            </ThemeProvider>
          </TrustsProvider>
        </Web3Provider>
      </HashRouter>
    </React.Fragment>
  )
}
