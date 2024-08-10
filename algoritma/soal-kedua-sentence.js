// Nomor 2

function longest(sentence){
    const arrSentence = sentence.split(' ')
    let max = 0
    let indexOfLongestWord = null

    for (let i = 0; i < arrSentence.length; i++) {
        if (arrSentence[i].length > max) {
            max = arrSentence[i].length
            indexOfLongestWord = i
        }
    }

    return arrSentence[indexOfLongestWord]
}

const sentence = 'Saya sangat senang mengerjakan soal algoritma'
console.log(longest(sentence)) // mengerjakan
