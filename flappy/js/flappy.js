function novoElemento(tagName, className){
    const elem = document.createElement(tagName) // recebe a tag que vai ser criada
    elem.className = className; // classe elemento
    return elem;
}

function Barreira(reversa=false){
    this.elemento = novoElemento('div','barreira') // criando barreira

    const borda = novoElemento('div','borda') // criando uma const para armz a borda
    const corpo = novoElemento('div','corpo') // criando uma const para armz o corpo
    this.elemento.appendChild(reversa ? corpo : borda) // criar primeiro corpo ou borda
    this.elemento.appendChild(reversa ? borda : corpo) // criar primeiro corpo ou borda

    this.setAltura = altura => corpo.style.height = `${altura}px` // setando a altura do corpo
}

function ParDeBarreiras(altura,abertura,x){
    this.elemento = novoElemento('div','par-de-barreiras')

    this.superior = new Barreira(true) // true barreira normal
    this.inferior = new Barreira(false) // false barreira reversa

    this.elemento.appendChild(this.superior.elemento) //adicionado o elemento
    this.elemento.appendChild(this.inferior.elemento) //adicionado o elemento

    this.sortearAbertura = () => { 
        const alturaSuperior = Math.random() * (altura - abertura) //calculando a altura superior
        const alturaInferior = altura - abertura - alturaSuperior // calculando altura inferior
        this.superior.setAltura(alturaSuperior) //setando altura na variavel
        this.inferior.setAltura(alturaInferior) //setando altura na variavel
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]) // pegando a posição X da barreira
    this.setX = x => this.elemento.style.left = `${x}px` // colocando a posição de x na variavel x
    this.getLargura = () => this.elemento.clientWidth // pegando a largura da barreira

    this.sortearAbertura() // chamando a função para sortear a abertura
    this.setX(x) // setando a posição do x
}

//const b = new ParDeBarreiras(700,200,800)
//document.querySelector('[wm-flappy]').appendChild(b.elemento) // criando o elemento

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3   
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento) //movendo as barreiras

            // quando o elemento sair da área do jogo
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if(cruzouOMeio) notificarPonto()
        })
    }
}

function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false
 
    this.animar = () => {
        const novoY = this.getY() + (voando ? 5 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}



function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizarPontos(0)
}

function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const horizontal = a.left + a.width >= b.left
        && b.left + b.width >= a.left
    const vertical = a.top + a.height >= b.top
        && b.top + b.height >= a.top
    return horizontal && vertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento
            const inferior = parDeBarreiras.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, superior)
                || estaoSobrepostos(passaro.elemento, inferior)
        }
    })
    return colidiu
}

function FlappyBird() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight
    const largura = areaDoJogo.clientWidth

    const progresso = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => progresso.atualizarPontos(++pontos))
    const passaro = new Passaro(altura)

    areaDoJogo.appendChild(progresso.elemento)
    areaDoJogo.appendChild(passaro.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

    this.start = () => {
        // loop do jogo
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
            }
        }, 20)
    }
}

new FlappyBird().start()