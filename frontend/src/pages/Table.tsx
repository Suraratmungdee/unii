import '../App.css'

function Table() {
  const size = 8
  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-[640px] h-[640px] grid grid-cols-8 border">
          {Array.from({ length: size }).map((_, row) =>
            Array.from({ length: size }).map((_, col) => {
              const isBlack = (row + col) % 2 !== 1
              const hasPiece = isBlack && (row < 2 || row > 5)
              return (
                <div
                  key={`${row}-${col}`}
                  className={`w-full aspect-square flex items-center justify-center ${isBlack ? 'bg-black' : 'bg-white'}`}
                >
                  {hasPiece && (<span className="text-yellow-400 font-bold">O</span>)}
                </div>
              )
            })
          )}
        </div>
      </div>

    </>

  )
}

export default Table