import SQL_TEMPLATE from './template.sql'

export default (flatConfig, database) => () => database.exec(SQL_TEMPLATE)
