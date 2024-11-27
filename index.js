const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const executeQuery = require('./db');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

try {
    oracledb.initOracleClient({ libDir: '/usr/lib/oracle/instantclient' }); // Atualize o caminho no ambiente Docker/local
} catch (err) {
    console.error('Erro ao inicializar o cliente Oracle:', err);
    process.exit(1);
}

app.get('/centro-custo', async (req, res) => {
    try {
        const result = await executeQuery("select\n" +
            "cc.cus_st_apelido ccusto,\n" +
            "cc.cus_st_descricao des_ccusto,\n" +
            "pro.pro_st_apelido projeto,\n" +
            "pro.pro_st_descricao des_projeto,\n" +
            " cc.CUS_TAB_IN_CODIGO , \n" +
            " cc.CUS_PAD_IN_CODIGO , \n" +
            " cc.CUS_IDE_ST_CODIGO , \n" +
            " cc.CUS_IN_REDUZIDO , \n" +
            " cc.CUS_ST_EXTENSO , \n" +
            " cc.CUS_CH_TIPO_CONTA , \n" +
            " cc.CUS_IN_NIVEL , \n" +
            " cc.CUS_ST_GRUPO_EXT , \n" +
            " cc.CUS_CH_ATIVADO , \n" +
            " cc.CUS_BO_FINANCEIRO , \n" +
            " cc.PAI_CUS_TAB_IN_CODIGO , \n" +
            " cc.PAI_CUS_PAD_IN_CODIGO , \n" +
            " cc.PAI_CUS_IDE_ST_CODIGO , \n" +
            " cc.PAI_CUS_IN_REDUZIDO , \n" +
            " cc.CUS_DT_IMPLANTACAO , \n" +
            " cc.CUS_DT_ULT_MOV , \n" +
            " cc.CUS_DT_LIMITE , \n" +
            " cc.CUS_ST_DESC_AUX , \n" +
            " cc.CON_CUS_TAB_IN_CODIGO , \n" +
            " cc.CON_CUS_PAD_IN_CODIGO , \n" +
            " cc.CON_CUS_IDE_ST_CODIGO , \n" +
            " cc.CON_CUS_IN_REDUZIDO , \n" +
            " cc.AGN_TAB_IN_CODIGO , \n" +
            " cc.AGN_PAD_IN_CODIGO , \n" +
            " cc.AGN_IN_CODIGO , \n" +
            " cc.AGN_TAU_ST_CODIGO ,\n" +
            " cc.CUS_BO_GLOBAL,\n" +
            " pro.PRO_TAB_IN_CODIGO , \n" +
            " pro.PRO_PAD_IN_CODIGO , \n" +
            " pro.PRO_IDE_ST_CODIGO , \n" +
            " pro.PRO_IN_REDUZIDO , \n" +
            " pro.PRO_ST_EXTENSO , \n" +
            " pro.PRO_CH_ANASIN , \n" +
            " pro.PRO_IN_NIVEL , \n" +
            " pro.PRO_ST_GRUPOEXT , \n" +
            " pro.PRO_BO_ATIVADOSALDO , \n" +
            " pro.PAI_PRO_TAB_IN_CODIGO ,\n" +
            " pro.PRO_BO_FINANCEIRO , \n" +
            " pro.PAI_PRO_PAD_IN_CODIGO , \n" +
            " pro.PAI_PRO_IDE_ST_CODIGO , \n" +
            " pro.PAI_PRO_IN_REDUZIDO , \n" +
            " pro.PRO_DT_IMPLANTACAO , \n" +
            " pro.PRO_DT_ULT_MOV , \n" +
            " pro.PRO_DT_LIMITE , \n" +
            " pro.PRO_ST_DESC_AUX , \n" +
            " pro.PRO_BO_GLOBAL , \n" +
            " pro.AGN_TAB_IN_CODIGO AGN_TAB_IN_CODIGO_pro, \n" +
            " pro.AGN_PAD_IN_CODIGO  AGN_PAD_IN_CODIGO_pro, \n" +
            " pro.AGN_IN_CODIGO AGN_IN_CODIGO_pro, \n" +
            " pro.AGN_TAU_ST_CODIGO AGN_TAU_ST_CODIGO_pro,\n" +
            " ccpro.CUS_TAB_IN_CODIGO CUS_TAB_IN_CODIGO_ccpro, \n" +
            " ccpro.CUS_PAD_IN_CODIGO CUS_PAD_IN_CODIGO_ccpro, \n" +
            " ccpro.CUS_IDE_ST_CODIGO CUS_IDE_ST_CODIGO_ccpro, \n" +
            " ccpro.CUS_IN_REDUZIDO CUS_IN_REDUZIDO_ccpro, \n" +
            " ccpro.PRO_TAB_IN_CODIGO PRO_TAB_IN_CODIGO_ccpro, \n" +
            " ccpro.PRO_PAD_IN_CODIGO PRO_PAD_IN_CODIGO_ccpro, \n" +
            " ccpro.PRO_IDE_ST_CODIGO PRO_IDE_ST_CODIGO_ccpro, \n" +
            " ccpro.PRO_IN_REDUZIDO PRO_IN_REDUZIDO_ccpro\n" +
            "from\n" +
            "    NEOVIA.con_centro_custo cc\n" +
            "        left join NEOVIA.glo_projetoccusto ccpro  \n" +
            "            ON  cc.cus_in_reduzido = ccpro.cus_in_reduzido\n" +
            "        inner join NEOVIA.glo_projetos pro\n" +
            "            ON ccpro.pro_in_reduzido = pro.pro_in_reduzido\n" +
            "where\n" +
            "cc.cus_in_nivel > 2 and\n" +
            "pro.pro_in_nivel > 2 and\n" +
            "ccpro.pro_pad_in_codigo = 1\n" +
            " \n" +
            "order by  cus_st_apelido desc");
        res.json( result );
    } catch (err) {
        res.status(500).json({ error: 'Erro ao executar a consulta.', details: err.message });
    }
})


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
