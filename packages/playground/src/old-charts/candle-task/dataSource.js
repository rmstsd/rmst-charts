// @ts-check

const dataSource = [
  { date: '01-01', openPrice: 80, closePrice: 160, topPrice: 200, bottomPrice: 180 },
  { date: '01-02', openPrice: 160, closePrice: 100, topPrice: 180, bottomPrice: 80 },
  { date: '01-03', openPrice: 180, closePrice: 160, topPrice: 67, bottomPrice: 165 },
  { date: '01-04', openPrice: 180, closePrice: 148, topPrice: 145, bottomPrice: 64 },
  { date: '01-05', openPrice: 160, closePrice: 95, topPrice: 146, bottomPrice: 159 },
  { date: '01-06', openPrice: 140, closePrice: 166, topPrice: 155, bottomPrice: 80 },
  { date: '01-07', openPrice: 76, closePrice: 99, topPrice: 164, bottomPrice: 173 },
  { date: '01-08', openPrice: 74, closePrice: 196, topPrice: 133, bottomPrice: 111 },
  { date: '01-09', openPrice: 101, closePrice: 100, topPrice: 94, bottomPrice: 117 },
  { date: '01-10', openPrice: 126, closePrice: 189, topPrice: 115, bottomPrice: 96 },
  { date: '01-11', openPrice: 140, closePrice: 166, topPrice: 155, bottomPrice: 80 },
  { date: '01-12', openPrice: 76, closePrice: 99, topPrice: 164, bottomPrice: 173 },
  { date: '01-13', openPrice: 74, closePrice: 196, topPrice: 133, bottomPrice: 111 },
  { date: '01-14', openPrice: 101, closePrice: 100, topPrice: 94, bottomPrice: 117 },
  { date: '01-15', openPrice: 126, closePrice: 189, topPrice: 115, bottomPrice: 96 }
]

const genRandom = (max, min, index) => Math.floor(Math.random() * (max - min) + min)
export const generateDataSource = (count, max, min) =>
  Array.from({ length: count }, (_, index) => ({
    date: `2020-01-${String(index + 1).padStart(2, '0')}`,
    openPrice: genRandom(max, min, index),
    closePrice: genRandom(max, min, index),
    topPrice: genRandom(max, min, index),
    bottomPrice: genRandom(max, min, index)
  }))
