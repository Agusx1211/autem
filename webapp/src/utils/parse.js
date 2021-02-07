
const duration = /(-?(?:\d+\.?\d*|\d*\.?\d+)(?:e[-+]?\d+)?)\s*([a-zµμ]*)/ig

/**
 * conversion ratios
 */

parse.nanosecond =
parse.ns = 1 / 1e6

parse['µs'] =
parse['μs'] =
parse.us =
parse.microsecond = 1 / 1e3

parse.millisekunde =
parse.milliseconde =
parse.milisegundo =
parse.millisecond =
parse.ms = 1

parse.zweite =
parse.deuxieme =
parse.seconde =
parse.segundo =
parse.second =
parse.sec =
parse.s = parse.ms * 1000

parse.minuto =
parse.minute =
parse.min =
parse.m = parse.s * 60

parse.zeit =
parse.temps =
parse.hora =
parse.hour =
parse.hr =
parse.h = parse.m * 60

parse.tag =
parse.jour =
parse.dia =
parse.day =
parse.d = parse.h * 24

parse.woche =
parse.semaine =
parse.semana =
parse.week =
parse.wk =
parse.w = parse.d * 7

parse.monat =
parse.mois =
parse.mes =
parse.meses =
parse.month =
parse.b =
parse.d * (365 / 12)

parse.jahr =
parse.an =
parse.ano =
parse.year =
parse.yr =
parse.y = parse.d * 365

/**
 * convert `str` to ms
 *
 * @param {String} str
 * @param {String} format
 * @return {Number}
 */

export default function parse(str='', format='ms') {
  var result = null

  // ignore commas
  str = str.replace(/(\d),(\d)/g, '$1$2')
  str.replace(duration, (_, n, units) => {
    units = parse[units] || parse[units.toLowerCase().replace(/s$/, '')]
    if (units) result = (result || 0) + parseFloat(n, 10) * units
  })

  return result && (result / parse[format])
}
