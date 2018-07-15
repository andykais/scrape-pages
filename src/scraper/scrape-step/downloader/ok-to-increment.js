const okToIncrement = ({ download = {} }, incrementIndex) => {
  const { increment, incrementUntil } = download

  if (increment && incrementUntil) {
    return incrementUntil > increment * incrementIndex
  } else if (increment) {
    return true
  } else {
    return false
  }
}

export { okToIncrement }
