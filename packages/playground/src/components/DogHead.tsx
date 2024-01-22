import dog from '@/assets/dog.png'

const DogHead = ({ size }) => {
  return <img src={dog} style={{ width: size, height: size, display: 'inline-block' }} />
}

export default DogHead
