export function valida(input) {
    const tipoDeInput = input.dataset.tipo

    if(validadores[tipoDeInput]) {
        validadores[tipoDeInput](input)
    }

    if (input.validity.valid) {
        input.parentElement.classList.remove('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = '';
    } else {
        input.parentElement.classList.add('input-container--invalido')
        input.parentElement.querySelector('.input-mensagem-erro').innerHTML = mostraMensagemDeErro(tipoDeInput, input);
    }
}

const tiposDeErro = [
    'valueMissing',
    'typeMismatch',
    'patternMismatch',
    'customError'
]

const mensagensDeErro = {
    nome: {
        valueMissing: 'Campo nome é obrigatório.'
    },
    email: {
        valueMissing: 'Campo e-mail é obrigatório.',
        typeMismatch: 'Formato inválido.'
    },
    senha: {
        valueMissing: 'Campo senha é obrigatório.',
        patternMismatch: 'A senha deve conter: mínimo de 6 caracteres e máximo de 12, uma letra maiúscula e uma minúscula, um número e não pode caracteres especiais.'
    },
    dataNascimento: {
        valueMissing: 'Campo data de nascimento é obrigatório.',
        customError: 'Para se cadastrar você precisar ter 18 anos ou mais'
    },
    cpf: {
        valueMissing: 'Campo CPF é obrigatório',
        customError: 'O CPF digitado não é válido.'
    },
    cep: {
        valueMissing: 'Campo CEP é obrigatório.',
        patternMismatch: 'O CEP digitado não é válido',
        customError: 'Digite um endereço de CEP válido.'
    },
    logradouro: {
        valueMissing: 'Campo logradouro é obrigatório.',
    },
    cidade: {
        valueMissing: 'Campo cidade é obrigatório.',
    },
    estado: {
        valueMissing: 'Campo estado é obrigatório.',
    },
    estado: {
        valueMissing: 'Campo preço é obrigatório.',
    }
}

const validadores = {
    dataNascimento: input => validacaoDataNascimento(input),
    cpf: input => validaCPF(input),
    cep:input => recuperCEP(input)
}

function mostraMensagemDeErro(tipoDeInput, input) {
    let mensagem = ''
    tiposDeErro.forEach( erro => {
        if (input.validity[erro]) {
            mensagem = mensagensDeErro[tipoDeInput][erro]
        }
    })

    return mensagem
}

function validacaoDataNascimento(input) {
    const dataRecebida = new Date(input.value);
    let mensagem = '';

    if(!maiorQueDezoito(dataRecebida)){
        mensagem = 'Para se cadastrar você precisar ter 18 anos ou mais'
    }

    input.setCustomValidity(mensagem);
}

function maiorQueDezoito(data){
    const dataAtual = new Date();
    const dataMaisDezoito = new Date(data.getUTCFullYear() + 18, data.getUTCMonth(), data.getUTCDate())

    return dataMaisDezoito <= dataAtual
}

function validaCPF(input) {
    const cpfFormatado = input.value.replace(/\D/g, '');
    let mensagem = '';

    if(!checaCPFRepetido(cpfFormatado) || !checaEstruturaCPF(cpfFormatado)) {
        mensagem = 'O CPF digitado não é válido.'
    }

    input.setCustomValidity(mensagem)
}

function checaCPFRepetido(cpf){

    const valoresRepetidos = [
        '00000000000',
        '11111111111',
        '22222222222',
        '33333333333',
        '44444444444',
        '55555555555',
        '66666666666',
        '77777777777',
        '88888888888',
        '99999999999'
    ]

    let cpfValido = true;

    valoresRepetidos.forEach(valor => {
        if(valor == cpf) {
            cpfValido = false
        }
    })

    return cpfValido;
}

function checaEstruturaCPF(cpf) {
    const multiplicador = 10

    return checaDigitoVerificador(cpf, multiplicador)
}

function checaDigitoVerificador(cpf, multiplicador) {
    if(multiplicador >= 12) {
        return true
    }

    let multiplicadorInicial = multiplicador
    let soma = 0
    const cpfSemDigitos = cpf.substr(0, multiplicador - 1).split('')
    const digitoVerificador = cpf.charAt(multiplicador - 1)
    for(let contador = 0; multiplicadorInicial > 1 ; multiplicadorInicial--) {
        soma = soma + cpfSemDigitos[contador] * multiplicadorInicial
        contador++
    }

    if(digitoVerificador == confirmaDigito(soma)) {
        return checaDigitoVerificador(cpf, multiplicador + 1)
    }

    return false
}

function confirmaDigito(soma) {
    return 11 - (soma % 11)
}

function recuperCEP(input){
    const cep = input.value.replace(/\D/g, '');
    const url = `https://viacep.com.br/ws/${cep}/json`;
    const options = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'content-type': 'application/json;charset=utf-8'
        }
    }

    if (!input.validity.patternMismatch && !input.validity.valueMissing) {
        fetch(url, options).then(
            response => response.json()
        ).then(
            data => {
                if (data.erro) {
                    input.setCustomValidity('Digite um endereço de CEP válido.');
                    return
                }
                input.setCustomValidity('');
                preencheCamposComCEP(data)
                return
            }
        )
    }
}

function preencheCamposComCEP(data) {
    const logradouro = document.querySelector('[data-tipo="logradouro"]')
    const cidade = document.querySelector('[data-tipo="cidade"]')
    const estado = document.querySelector('[data-tipo="estado"]')

    logradouro.value = data.logradouro
    cidade.value = data.localidade
    estado.value = data.uf
}