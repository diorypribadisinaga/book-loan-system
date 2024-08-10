// Soal nomor 1

function reverse(str){
    let strAlphabet = ''
    let strNumber = ''

    for (const strElement of str) {
        (! +strElement) ? strAlphabet += strElement : strNumber += strElement
    }

    const strAlphabetArr = new Array(...strAlphabet)
    const strAlphabetReverse = strAlphabetArr.reverse().join('')

    return strAlphabetReverse + strNumber
}

console.log(reverse("NEGIE1"))  // "EIGEN1"