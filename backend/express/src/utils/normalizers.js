export function dataParaISO(dataTexto) {
    const meses = {
        'janeiro': '01',
        'fevereiro': '02',
        'março': '03',
        'abril': '04',
        'maio': '05',
        'junho': '06',
        'julho': '07',
        'agosto': '08',
        'setembro': '09',
        'outubro': '10',
        'novembro': '11',
        'dezembro': '12'
    };

    const limpo = dataTexto.replace(/\s*hs\.?\s*$/i, '').trim();

    const regex = /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})\s+(\d{1,2}):(\d{2})/i;
    const match = limpo.match(regex);

    if (!match) {
        throw new Error('Formato de data inválido');
    }

    const [, dia, mesNome, ano, hora, minuto] = match;
    const mes = meses[mesNome.toLowerCase()];

    if (!mes) {
        throw new Error(`Mês desconhecido: ${mesNome}`);
    }

    const diaFormatado = dia.padStart(2, '0');
    const horaFormatada = hora.padStart(2, '0');

    return `${ano}-${mes}-${diaFormatado}T${horaFormatada}:${minuto}:00`;
}

export function parseToISO(dateStr) {
    const [date, time] = dateStr.split(' ');
    const [day, month, year] = date.split('/');
    return new Date(`${year}-${month}-${day}T${time}`).toISOString();
}

export function parseToFloat(value) {
    return parseFloat(value.replace(/[R$\s.]/g, '').replace(',', '.'));
}