// Nomor 3

function countWordsInArray(input, query){
    const result = []
    for (const queryElement of query) {
        result.push(input.filter(inputElement => inputElement === queryElement).length)
    }
    return result
}

const INPUT = ['xc', 'dz', 'bbb', 'dz']
const QUERY = ['bbb', 'ac', 'dz']
console.log(countWordsInArray(INPUT, QUERY)) // [1, 0 ,2]
