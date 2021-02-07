
import React from 'react'
import Grid from '@material-ui/core/Grid'
import { useTrustsContext } from '../services/Trusts'
import Card from './Card'
import { makeStyles, Typography } from '@material-ui/core'

const useStyles = makeStyles(() => ({
  empty: {
    textAlign: 'center',
    color: "rgba(0, 0, 0, 0.20)"
  }
}))

export default function Main() {
  const styles = useStyles()

  const { knownTrusts, hiddenTrusts } = useTrustsContext()

  const showTrusts = knownTrusts.filter((t) => hiddenTrusts.indexOf(t) === -1)

  return (
    <main>
      <Grid container spacing={4}>
        {showTrusts.length !== 0 && knownTrusts.map((trust) => (
          <Grid item key={trust} xs={12} sm={6} md={4}>
            <Card trust={trust}></Card>
          </Grid>
        ))}
      </Grid>
      {showTrusts.length === 0 && <Typography variant="h2" className={styles.empty}>
          No trusts found
      </Typography>}
    </main>
  )
}
