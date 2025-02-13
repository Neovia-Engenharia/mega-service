const express = require('express');
const bodyParser = require('body-parser');
const oracledb = require('oracledb');
const executeQuery = require('./db');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

try {
    oracledb.initOracleClient({libDir: '/usr/lib/oracle/instantclient'});
} catch (err) {
    console.error('Erro ao inicializar o cliente Oracle:', err);
    process.exit(1);
}


app.get('/contrato/domicilio', async (req, res) => {
    try {
        const result = await executeQuery("select * from NEO_VW_DOMICILIO_BANCARIO ");
        res.json(result);
    } catch (err) {
        res.status(500).json({error: 'Erro ao executar a consulta.', details: err.message});
    }
});

app.get('/contrato/sare', async (req, res) => {
    try {
        const result = await executeQuery("    select\n" +
            "      sysdate job_dt_hora,\n" +
            "      n.agn_tab_in_codigo,\n" +
            "      n.agn_pad_in_codigo,\n" +
            "      n.agn_in_codigo,\n" +
            "      n.agn_tau_st_codigo,\n" +
            "      c.cus_tab_in_codigo, \n" +
            "      c.cus_pad_in_codigo,\n" +
            "      c.cus_ide_st_codigo,\n" +
            "      c.cus_in_reduzido,\n" +
            "      p.pro_tab_in_codigo,\n" +
            "      p.pro_pad_in_codigo,\n" +
            "      p.pro_ide_st_codigo,\n" +
            "      p.pro_in_reduzido,\n" +
            "      n.not_in_numero,\n" +
            "      decode(n.org_in_codigo, 3, 'Neovia', 12, 'TV') org_in_codigo,\n" +
            "      n.not_dt_emissao,\n" +
            "      n.not_re_valortotal,\n" +
            "      decode(sign(n.not_dt_emissao - to_date('09/11/2017','dd/mm/rrrr')), -1, null,\n" +
            "                  decode(i.itn_st_complemento, null, null,to_char(to_date(i.itn_st_complemento,'mm/yyyy'),'mm/rrrr')))  itn_st_complemento,\n" +
            "      i.itn_st_pedidocliente,\n" +
            "      nvl(trt.total,0) mov_re_irpcc,\n" +
            "      nvl(tin.total,0) mov_re_inss,\n" +
            "      nvl(tis.total,0) mov_re_iss,\n" +
            "      decode(sign(n.not_dt_emissao - to_date('23/01/2019','dd/mm/rrrr')), -1,\n" +
            "                  n.not_re_valoriss, n.not_re_valorissdevido) mov_re_isscusto,\n" +
            "      (n.not_re_valortotal - nvl(trt.total,0) - nvl(tin.total,0) - nvl(tis.total,0) - nvl(tic.total,0)) not_re_valorliquido,\n" +
            "      nvl(tic.total,0) as \"Caução\",\n" +
            "      decode(F_SALDONADATA(U.Org_in_Codigo,\n" +
            "                               U.Mov_Seq_in_Codigo,\n" +
            "                               U.Mov_in_NumLancto,\n" +
            "                               0,\n" +
            "                               to_date(sysdate,'dd/mm/yyyy'),\n" +
            "                               'SR',\n" +
            "                               'S'), 0,\n" +
            "                                        decode(nvl(cnc.total,0), 0, 'Paga',\n" +
            "                                                                    'Cancelada'),\n" +
            "                                        decode(nvl(tbx.bx,0), 0,\n" +
            "                                                              'Emitida',\n" +
            "                                                              'Paga Parcial')) not_ch_situacao,\n" +
            "      nvl(tbx.dtbaixa, '') mov_dt_baixai,\n" +
            "      nvl(tbx.bx,0) mov_re_valorbaixa,\n" +
            "      nvl(cnc.total,0) mov_re_abatimento,\n" +
            "      nvl(tbj.bj,0) mov_re_juros,\n" +
            "      nvl(tbm.bm,0) mov_re_multa,\n" +
            "      NVL(tbd.bd,0) mov_re_desconto,\n" +
            "      \n" +
            "     to_number(Substr(nvl(i.Itn_St_Pedidocliente,0), 0,2)) itn_st_pedidoclientesub,\n" +
            "      \n" +
            "      decode(sign(n.not_dt_emissao - to_date('09/11/2017','dd/mm/rrrr')), -1, null,\n" +
            "            decode(i.itn_st_complemento, null, null,trunc(to_date(i.itn_st_complemento,'mm/yyyy'),'month')))  not_dt_medicao\n" +
            "\n" +
            "    from ven_notafiscal n\n" +
            "    inner join ven_itemnotafiscal i\n" +
            "      on  n.org_tab_in_codigo = i.org_tab_in_codigo\n" +
            "      and n.org_pad_in_codigo = i.org_pad_in_codigo\n" +
            "      and n.org_in_codigo = i.org_in_codigo\n" +
            "      and n.org_tau_st_codigo = i.org_tau_st_codigo\n" +
            "      and n.seq_tab_in_codigo = i.seq_tab_in_codigo\n" +
            "      and n.seq_in_codigo = i.seq_in_codigo\n" +
            "      and n.not_in_codigo = i.not_in_codigo\n" +
            "\n" +
            "    inner join con_centro_custo c\n" +
            "      on  i.cus_tab_in_codigo = c.cus_tab_in_codigo\n" +
            "      and i.cus_pad_in_codigo = c.cus_pad_in_codigo\n" +
            "      and i.cus_ide_st_codigo = c.cus_ide_st_codigo\n" +
            "      and i.cus_in_reduzido = c.cus_in_reduzido\n" +
            "\n" +
            "    inner join glo_projetos p\n" +
            "      on  i.proj_tab_in_codigo = p.pro_tab_in_codigo\n" +
            "      and i.proj_pad_in_codigo = p.pro_pad_in_codigo\n" +
            "      and i.proj_ide_st_codigo = p.pro_ide_st_codigo\n" +
            "      and i.proj_in_reduzido  = p.pro_in_reduzido\n" +
            "     \n" +
            "    inner join fin_movimento u\n" +
            "      on  n.org_tab_in_codigo  = u.org_tab_in_codigo\n" +
            "      and n.org_pad_in_codigo  = u.org_pad_in_codigo\n" +
            "      and n.org_in_codigo      = u.org_in_codigo\n" +
            "      and n.org_tau_st_codigo  = u.org_tau_st_codigo\n" +
            "      and n.fil_in_codigo      = u.fil_in_codigo\n" +
            "      and n.acaom_in_sequencia = u.acaom_in_sequencia\n" +
            "\n" +
            "    left join\n" +
            "     (select\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto,\n" +
            "      sum(nvl(mrt.mov_re_valor,0)) total\n" +
            "\n" +
            "      from\n" +
            "      fin_referenciafin frf\n" +
            "      inner join fin_movimento mrt\n" +
            "      on  frf.org_tab_in_codigo = mrt.org_tab_in_codigo\n" +
            "      and frf.org_pad_in_codigo = mrt.org_pad_in_codigo\n" +
            "      and frf.org_in_codigo     = mrt.org_in_codigo\n" +
            "      and frf.org_tau_st_codigo = mrt.org_tau_st_codigo\n" +
            "      and frf.mov_tab_in_codigo = mrt.mov_tab_in_codigo\n" +
            "      and frf.mov_seq_in_codigo = mrt.mov_seq_in_codigo\n" +
            "      and frf.mov_in_numlancto  = mrt.mov_in_numlancto\n" +
            "      and frf.ref_st_tipo in ('PISRETR','COFINSRETR','CSLLRETR','IRRETR')\n" +
            "      and mrt.mov_dt_datadocto <= to_date(sysdate,'dd/mm/yyyy')\n" +
            "\n" +
            "      group by\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto\n" +
            "     ) trt\n" +
            "\n" +
            "     on  u.org_tab_in_codigo = trt.ref_org_tab_in_codigo\n" +
            "     and u.org_pad_in_codigo = trt.ref_org_pad_in_codigo\n" +
            "     and u.org_in_codigo     = trt.ref_org_in_codigo\n" +
            "     and u.org_tau_st_codigo = trt.ref_org_tau_st_codigo\n" +
            "     and u.mov_tab_in_codigo = trt.ref_mov_tab_in_codigo\n" +
            "     and u.mov_seq_in_codigo = trt.ref_mov_seq_in_codigo\n" +
            "     and u.mov_in_numlancto  = trt.ref_mov_in_numlancto\n" +
            "\n" +
            "    left join\n" +
            "     (select\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto,\n" +
            "      sum(nvl(mrn.mov_re_valor,0)) total\n" +
            "      from\n" +
            "      fin_referenciafin frf\n" +
            "      inner join fin_movimento mrn\n" +
            "      on  frf.org_tab_in_codigo = mrn.org_tab_in_codigo\n" +
            "      and frf.org_pad_in_codigo = mrn.org_pad_in_codigo\n" +
            "      and frf.org_in_codigo     = mrn.org_in_codigo\n" +
            "      and frf.org_tau_st_codigo = mrn.org_tau_st_codigo\n" +
            "      and frf.mov_tab_in_codigo = mrn.mov_tab_in_codigo\n" +
            "      and frf.mov_seq_in_codigo = mrn.mov_seq_in_codigo\n" +
            "      and frf.mov_in_numlancto  = mrn.mov_in_numlancto\n" +
            "      and frf.ref_st_tipo in ('INSSRETR')\n" +
            "      and mrn.mov_dt_datadocto <= to_date(sysdate,'dd/mm/yyyy')\n" +
            "\n" +
            "      group by\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto\n" +
            "     ) tin\n" +
            "\n" +
            "     on  u.org_tab_in_codigo = tin.ref_org_tab_in_codigo\n" +
            "     and u.org_pad_in_codigo = tin.ref_org_pad_in_codigo\n" +
            "     and u.org_in_codigo     = tin.ref_org_in_codigo\n" +
            "     and u.org_tau_st_codigo = tin.ref_org_tau_st_codigo\n" +
            "     and u.mov_tab_in_codigo = tin.ref_mov_tab_in_codigo\n" +
            "     and u.mov_seq_in_codigo = tin.ref_mov_seq_in_codigo\n" +
            "     and u.mov_in_numlancto  = tin.ref_mov_in_numlancto\n" +
            "\n" +
            "    left join\n" +
            "     (select\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto,\n" +
            "      sum(nvl(mri.mov_re_valor,0)) total\n" +
            "\n" +
            "      from\n" +
            "      fin_referenciafin frf\n" +
            "      inner join fin_movimento mri\n" +
            "      on  frf.org_tab_in_codigo = mri.org_tab_in_codigo\n" +
            "      and frf.org_pad_in_codigo = mri.org_pad_in_codigo\n" +
            "      and frf.org_in_codigo     = mri.org_in_codigo\n" +
            "      and frf.org_tau_st_codigo = mri.org_tau_st_codigo\n" +
            "      and frf.mov_tab_in_codigo = mri.mov_tab_in_codigo\n" +
            "      and frf.mov_seq_in_codigo = mri.mov_seq_in_codigo\n" +
            "      and frf.mov_in_numlancto  = mri.mov_in_numlancto\n" +
            "      and frf.ref_st_tipo in ('ISSRETR')\n" +
            "      and mri.mov_dt_datadocto <= to_date(sysdate,'dd/mm/yyyy')\n" +
            "\n" +
            "      group by\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto\n" +
            "     ) tis\n" +
            "\n" +
            "     on  u.org_tab_in_codigo = tis.ref_org_tab_in_codigo\n" +
            "     and u.org_pad_in_codigo = tis.ref_org_pad_in_codigo\n" +
            "     and u.org_in_codigo     = tis.ref_org_in_codigo\n" +
            "     and u.org_tau_st_codigo = tis.ref_org_tau_st_codigo\n" +
            "     and u.mov_tab_in_codigo = tis.ref_mov_tab_in_codigo\n" +
            "     and u.mov_seq_in_codigo = tis.ref_mov_seq_in_codigo\n" +
            "     and u.mov_in_numlancto  = tis.ref_mov_in_numlancto\n" +
            "\n" +
            "    left join\n" +
            "     (select\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto,\n" +
            "      sum(nvl(mrc.mov_re_valor,0)) total\n" +
            "\n" +
            "      from\n" +
            "      fin_referenciafin frf\n" +
            "      inner join fin_movimento mrc\n" +
            "      on  frf.org_tab_in_codigo = mrc.org_tab_in_codigo\n" +
            "      and frf.org_pad_in_codigo = mrc.org_pad_in_codigo\n" +
            "      and frf.org_in_codigo     = mrc.org_in_codigo\n" +
            "      and frf.org_tau_st_codigo = mrc.org_tau_st_codigo\n" +
            "      and frf.mov_tab_in_codigo = mrc.mov_tab_in_codigo\n" +
            "      and frf.mov_seq_in_codigo = mrc.mov_seq_in_codigo\n" +
            "      and frf.mov_in_numlancto  = mrc.mov_in_numlancto\n" +
            "      and frf.ref_st_tipo in ('CAUCAO')\n" +
            "      and mrc.mov_dt_datadocto <= to_date(sysdate,'dd/mm/yyyy')\n" +
            "\n" +
            "      group by\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto\n" +
            "     ) tic\n" +
            "\n" +
            "     on  u.org_tab_in_codigo = tic.ref_org_tab_in_codigo\n" +
            "     and u.org_pad_in_codigo = tic.ref_org_pad_in_codigo\n" +
            "     and u.org_in_codigo     = tic.ref_org_in_codigo\n" +
            "     and u.org_tau_st_codigo = tic.ref_org_tau_st_codigo\n" +
            "     and u.mov_tab_in_codigo = tic.ref_mov_tab_in_codigo\n" +
            "     and u.mov_seq_in_codigo = tic.ref_mov_seq_in_codigo\n" +
            "     and u.mov_in_numlancto  = tic.ref_mov_in_numlancto\n" +
            "\n" +
            "    left join\n" +
            "     (select\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto,\n" +
            "      sum(decode(mbx.mov_ch_natureza,'C', mbx.mov_re_valor, mbx.mov_re_valor*-1)) bx,\n" +
            "      max(mbx.mov_dt_datadocto) dtbaixa\n" +
            "\n" +
            "      from\n" +
            "      fin_referenciafin frf\n" +
            "      inner join fin_movimento mbx\n" +
            "      on  frf.org_tab_in_codigo = mbx.org_tab_in_codigo\n" +
            "      and frf.org_pad_in_codigo = mbx.org_pad_in_codigo\n" +
            "      and frf.org_in_codigo     = mbx.org_in_codigo\n" +
            "      and frf.org_tau_st_codigo = mbx.org_tau_st_codigo\n" +
            "      and frf.mov_tab_in_codigo = mbx.mov_tab_in_codigo\n" +
            "      and frf.mov_seq_in_codigo = mbx.mov_seq_in_codigo\n" +
            "      and frf.mov_in_numlancto  = mbx.mov_in_numlancto\n" +
            "      and frf.ref_st_tipo in ('BXCRE','BXCRE*')\n" +
            "      and mbx.mov_dt_datadocto <= to_date(sysdate,'dd/mm/yyyy')\n" +
            "\n" +
            "      group by\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto\n" +
            "     ) tbx\n" +
            "\n" +
            "     on  u.org_tab_in_codigo = tbx.ref_org_tab_in_codigo\n" +
            "     and u.org_pad_in_codigo = tbx.ref_org_pad_in_codigo\n" +
            "     and u.org_in_codigo     = tbx.ref_org_in_codigo\n" +
            "     and u.org_tau_st_codigo = tbx.ref_org_tau_st_codigo\n" +
            "     and u.mov_tab_in_codigo = tbx.ref_mov_tab_in_codigo\n" +
            "     and u.mov_seq_in_codigo = tbx.ref_mov_seq_in_codigo\n" +
            "     and u.mov_in_numlancto  = tbx.ref_mov_in_numlancto\n" +
            "\n" +
            "    left join\n" +
            "     (select\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto,\n" +
            "      sum(nvl(abt.mov_re_valor,0)) total\n" +
            "\n" +
            "      from\n" +
            "      fin_referenciafin frf\n" +
            "      inner join fin_movimento abt\n" +
            "      on  frf.org_tab_in_codigo  = abt.org_tab_in_codigo\n" +
            "      and frf.org_pad_in_codigo =  abt.org_pad_in_codigo\n" +
            "      and frf.org_in_codigo      = abt.org_in_codigo\n" +
            "      and frf.org_tau_st_codigo  = abt.org_tau_st_codigo\n" +
            "      and frf.mov_tab_in_codigo  = abt.mov_tab_in_codigo\n" +
            "      and frf.mov_seq_in_codigo  = abt.mov_seq_in_codigo\n" +
            "      and frf.mov_in_numlancto   = abt.mov_in_numlancto\n" +
            "      and frf.ref_st_tipo in ('ABAT')\n" +
            "      and abt.mov_dt_datadocto <= to_date(sysdate,'dd/mm/yyyy')\n" +
            "\n" +
            "      where abt.acao_in_codigo = 987\n" +
            "\n" +
            "      group by\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto\n" +
            "     ) cnc\n" +
            "\n" +
            "     on  u.org_tab_in_codigo = cnc.ref_org_tab_in_codigo\n" +
            "     and u.org_pad_in_codigo = cnc.ref_org_pad_in_codigo\n" +
            "     and u.org_in_codigo     = cnc.ref_org_in_codigo\n" +
            "     and u.org_tau_st_codigo = cnc.ref_org_tau_st_codigo\n" +
            "     and u.mov_tab_in_codigo = cnc.ref_mov_tab_in_codigo\n" +
            "     and u.mov_seq_in_codigo = cnc.ref_mov_seq_in_codigo\n" +
            "     and u.mov_in_numlancto  = cnc.ref_mov_in_numlancto\n" +
            "\n" +
            "    left join\n" +
            "     (select\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto,\n" +
            "      sum(decode(mbj.mov_ch_natureza,'C', mbj.mov_re_valor, mbj.mov_re_valor*-1)) bj\n" +
            "\n" +
            "      from\n" +
            "      fin_referenciafin frf\n" +
            "      inner join fin_movimento mbJ\n" +
            "      on  frf.org_tab_in_codigo = mbj.org_tab_in_codigo\n" +
            "      and frf.org_pad_in_codigo = mbj.org_pad_in_codigo\n" +
            "      and frf.org_in_codigo     = mbj.org_in_codigo\n" +
            "      and frf.org_tau_st_codigo = mbj.org_tau_st_codigo\n" +
            "      and frf.mov_tab_in_codigo = mbj.mov_tab_in_codigo\n" +
            "      and frf.mov_seq_in_codigo = mbj.mov_seq_in_codigo\n" +
            "      and frf.mov_in_numlancto  = mbj.mov_in_numlancto\n" +
            "      and frf.ref_st_tipo in ('BXJUROS','BXJUROS*')\n" +
            "      and mbj.mov_dt_datadocto <= to_date(sysdate,'dd/mm/yyyy')\n" +
            "\n" +
            "      group by\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto\n" +
            "     ) tbj\n" +
            "\n" +
            "     on  u.org_tab_in_codigo = tbj.ref_org_tab_in_codigo\n" +
            "     and u.org_pad_in_codigo = tbj.ref_org_pad_in_codigo\n" +
            "     and u.org_in_codigo     = tbj.ref_org_in_codigo\n" +
            "     and u.org_tau_st_codigo = tbj.ref_org_tau_st_codigo\n" +
            "     and u.mov_tab_in_codigo = tbj.ref_mov_tab_in_codigo\n" +
            "     and u.mov_seq_in_codigo = tbj.ref_mov_seq_in_codigo\n" +
            "     and u.mov_in_numlancto  = tbj.ref_mov_in_numlancto\n" +
            "\n" +
            "    left join\n" +
            "     (select\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto,\n" +
            "      sum(decode(mbm.mov_ch_natureza,'C', mbm.mov_re_valor, mbm.mov_re_valor*-1)) bm\n" +
            "\n" +
            "      from\n" +
            "\n" +
            "      fin_referenciafin frf\n" +
            "      inner join fin_movimento mbm\n" +
            "      on  frf.org_tab_in_codigo = mbm.org_tab_in_codigo\n" +
            "      and frf.org_pad_in_codigo = mbm.org_pad_in_codigo\n" +
            "      and frf.org_in_codigo     = mbm.org_in_codigo\n" +
            "      and frf.org_tau_st_codigo = mbm.org_tau_st_codigo\n" +
            "      and frf.mov_tab_in_codigo = mbm.mov_tab_in_codigo\n" +
            "      and frf.mov_seq_in_codigo = mbm.mov_seq_in_codigo\n" +
            "      and frf.mov_in_numlancto  = mbm.mov_in_numlancto\n" +
            "      and frf.ref_st_tipo in ('BXMULTA','BXMULTA*')\n" +
            "      and mbm.mov_dt_datadocto <= to_date(sysdate,'dd/mm/yyyy')\n" +
            "\n" +
            "      group by\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto\n" +
            "     ) tbm\n" +
            "\n" +
            "     on  u.org_tab_in_codigo = tbm.ref_org_tab_in_codigo\n" +
            "     and u.org_pad_in_codigo = tbm.ref_org_pad_in_codigo\n" +
            "     and u.org_in_codigo     = tbm.ref_org_in_codigo\n" +
            "     and u.org_tau_st_codigo = tbm.ref_org_tau_st_codigo\n" +
            "     and u.mov_tab_in_codigo = tbm.ref_mov_tab_in_codigo\n" +
            "     and u.mov_seq_in_codigo = tbm.ref_mov_seq_in_codigo\n" +
            "     and u.mov_in_numlancto  = tbm.ref_mov_in_numlancto\n" +
            "\n" +
            "    left join\n" +
            "     (select\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto,\n" +
            "      sum(decode(mbd.mov_ch_natureza,'C', mbd.mov_re_valor, mbd.mov_re_valor*-1)) bd\n" +
            "\n" +
            "      from\n" +
            "      fin_referenciafin frf\n" +
            "      inner join fin_movimento mbd\n" +
            "      on  frf.org_tab_in_codigo = mbd.org_tab_in_codigo\n" +
            "      and frf.org_pad_in_codigo = mbd.org_pad_in_codigo\n" +
            "      and frf.org_in_codigo     = mbd.org_in_codigo\n" +
            "      and frf.org_tau_st_codigo = mbd.org_tau_st_codigo\n" +
            "      and frf.mov_tab_in_codigo = mbd.mov_tab_in_codigo\n" +
            "      and frf.mov_seq_in_codigo = mbd.mov_seq_in_codigo\n" +
            "      and frf.mov_in_numlancto  = mbd.mov_in_numlancto\n" +
            "      and frf.ref_st_tipo in ('DESC','DESC*')\n" +
            "      and mbd.mov_dt_datadocto <= to_date(sysdate,'dd/mm/yyyy')\n" +
            "\n" +
            "      group by\n" +
            "      frf.ref_org_tab_in_codigo,\n" +
            "      frf.ref_org_pad_in_codigo,\n" +
            "      frf.ref_org_in_codigo,\n" +
            "      frf.ref_org_tau_st_codigo,\n" +
            "      frf.ref_mov_tab_in_codigo,\n" +
            "      frf.ref_mov_seq_in_codigo,\n" +
            "      frf.ref_mov_in_numlancto\n" +
            "     ) tbd\n" +
            "\n" +
            "     on  u.org_tab_in_codigo = tbd.ref_org_tab_in_codigo\n" +
            "     and u.org_pad_in_codigo = tbd.ref_org_pad_in_codigo\n" +
            "     and u.org_in_codigo     = tbd.ref_org_in_codigo\n" +
            "     and u.org_tau_st_codigo = tbd.ref_org_tau_st_codigo\n" +
            "     and u.mov_tab_in_codigo = tbd.ref_mov_tab_in_codigo\n" +
            "     and u.mov_seq_in_codigo = tbd.ref_mov_seq_in_codigo\n" +
            "     and u.mov_in_numlancto  = tbd.ref_mov_in_numlancto\n" +
            "\n" +
            "    where\n" +
            "          n.not_ch_situacao <> 'C'\n" +
            "      and u.mov_ch_origem = 'R'\n" +
            "      and n.not_in_codigo not in (90201,90202,90216,90217,90218,4019,4020,4021)\n" +
            "      and u.tref_st_codigo is null\n" +
            "      and n.org_in_codigo in (3,12)\n" +
            "      and n.tpd_in_codigo in (1,11,30,31,41)\n" +
            "      and n.agn_tau_st_codigo = 'C'\n" +
            "   order by\n" +
            "      n.fil_in_codigo, n.not_in_numero;\n");
        res.json(result);
    } catch (err) {
        res.status(500).json({error: 'Erro ao executar a consulta.', details: err.message});
    }
});

app.get('/contrato/centro-custo/projeto/:reduzido', async (req, res) => {
    try {
        let { reduzido } = req.params;
        if(!reduzido){
            return res.status(400).json({error: "Parâmetros em branco!!!!"})
        };

        reduzido = isNaN(reduzido) ? reduzido : Number(reduzido);

        let sqlQuery = `select * from neo_vw_dados_contratos where cus_in_reduzido = :1`;

        const result = await executeQuery(sqlQuery, [reduzido]);
        res.json(result);
    } catch (err) {
        res.status(500).json({error: 'Erro ao executar a consulta.', details: err.message});
    }
});

app.get('/contrato/centro-custo/projeto', async (req, res) => {
    try {
        const result = await executeQuery("select * from neo_vw_dados_contratos ");
        res.json(result);
    } catch (err) {
        res.status(500).json({error: 'Erro ao executar a consulta.', details: err.message});
    }
});


app.get('/contrato/centro-custo/projeto/apagar', async (req, res) => {
    try {
        const result = await executeQuery("select\n" +
            "sysdate job_dt_hora,\n" +
            "a.cus_pad_in_codigo,\n" +
            "a.cus_ide_st_codigo,\n" +
            "a.cus_in_reduzido,\n" +
            "a.pro_pad_in_codigo,\n" +
            "a.pro_ide_st_codigo,\n" +
            "a.pro_in_reduzido,\n" +
            "to_char(nvl(d.agn_pad_in_codigo,0)) agn_pad_in_codigo,\n" +
            "to_char(nvl(d.agn_in_codigo,0)) agn_in_codigo,\n" +
            "d.agn_tau_st_codigo,\n" +
            "c.agn_st_fantasia cli_st_fantasia,\n" +
            "nvl(d.pro_re_aliq_reidi,0) pro_re_aliq_reidi,\n" +
            "nvl(d.pro_re_aliq_caucao,0) pro_re_aliq_caucao,\n" +
            "to_char(nvl(d.org_tab_in_codigo,0)) fil_tab_in_codigo,\n" +
            "to_char(nvl(d.org_pad_in_codigo,0)) fil_pad_in_codigo,\n" +
            "to_char(nvl(d.org_in_codigo,0)) fil_in_codigo,\n" +
            "o.agn_st_fantasia fil_st_fantasia,\n" +
            "d.pro_st_contrato,\n" +
            "d.pro_st_rodovia,\n" +
            "d.pro_st_local\n" +
            "from glo_projetoccusto a\n" +
            "left join alx_glodadoscontrato d\n" +
            " on a.cus_tab_in_codigo = d.cus_tab_in_codigo\n" +
            "and a.cus_pad_in_codigo = d.cus_pad_in_codigo\n" +
            "and a.cus_ide_st_codigo = d.cus_ide_st_codigo\n" +
            "and a.cus_in_reduzido   = d.cus_in_reduzido\n" +
            "and a.pro_tab_in_codigo = d.pro_tab_in_codigo\n" +
            "and a.pro_pad_in_codigo = d.pro_pad_in_codigo\n" +
            "and a.pro_ide_st_codigo = d.pro_ide_st_codigo\n" +
            "and a.pro_in_reduzido   = d.pro_in_reduzido\n" +
            "left join glo_agentes c\n" +
            " on d.agn_tab_in_codigo = c.agn_tab_in_codigo\n" +
            "and d.agn_pad_in_codigo = c.agn_pad_in_codigo\n" +
            "and d.agn_in_codigo     = c.agn_in_codigo\n" +
            "left join glo_agentes o\n" +
            " on d.org_tab_in_codigo = c.agn_tab_in_codigo\n" +
            "and d.org_pad_in_codigo = c.agn_pad_in_codigo\n" +
            "and d.org_in_codigo = c.agn_in_codigo\n");
        res.json(result);
    } catch (err) {
        res.status(500).json({error: 'Erro ao executar a consulta.', details: err.message});
    }
});

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
        res.json(result);
    } catch (err) {
        res.status(500).json({error: 'Erro ao executar a consulta.', details: err.message});
    }
})


app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
