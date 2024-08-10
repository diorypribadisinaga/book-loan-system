// Soal keempat

function solve(Matrix){
    const matrixSize = Matrix[0].length
    let firstDiagonal = 0
    let secondDiagonal = 0
    for (let i = 0; i < matrixSize; i++) {
        firstDiagonal += Matrix[i][i]
        secondDiagonal += Matrix[i][matrixSize-i-1]
    }
    return firstDiagonal - secondDiagonal;
}

const Matrix = [[1, 2, 0], [4, 5, 6], [7, 8, 9]];
console.log(solve(Matrix)) //3
