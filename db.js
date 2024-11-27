const oracledb = require("oracledb");

module.exports = async function executeQuery(query, params = []) {
    let connection;

    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER || 'excel07',
            password: process.env.DB_PASSWORD || 'excas07',
            connectString: process.env.DB_CONNECT_STRING || '10.13.40.122:1521/mega07.vncneoviapriv.vcnneovia.oraclevcn.com',
        });

        console.log('Conectado ao banco Oracle');
        const result = await connection.execute(query, params, {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });
        return result.rows;
    } catch (err) {
        console.error('Erro ao executar a consulta:', err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Conexão fechada');
            } catch (err) {
                console.error('Erro ao fechar a conexão:', err);
            }
        }
    }
}
