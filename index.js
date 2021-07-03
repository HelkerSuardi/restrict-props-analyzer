'use strict'

const setJustAllowedFields = (configuration, inputValue, valueToReceiveChanges) => {
  if (typeof inputValue !== 'object') {
    return
  }

  for (const key of Object.keys(configuration)) {
    const newValueHasTheKey = Object.keys(inputValue).includes(key)

    if (!newValueHasTheKey) {
      continue
    }

    if (configuration[key] === 'target') {
      valueToReceiveChanges[key] = inputValue[key]
      continue
    }

    if (configuration[key].objectArray) {
      if (!inputValue[key]) {
        valueToReceiveChanges[key] = inputValue[key]
        continue
      }

      valueToReceiveChanges[key] = valueToReceiveChanges[key] || []
      const newItems = []

      for (let newItemOfArray of inputValue[key]) {
        const indexInOldValue = valueToReceiveChanges[key].findIndex(item => {
          return newItemOfArray._id && item._id.toString() === newItemOfArray._id.toString()
        })

        if (indexInOldValue < 0) {
          valueToReceiveChanges[key].push({})

          const oldValueLength = valueToReceiveChanges[key].length - 1

          setJustAllowedFields(configuration[key].props, newItemOfArray, valueToReceiveChanges[key][oldValueLength])
          newItems.push(valueToReceiveChanges[key][oldValueLength]?._id?.toString())
        } else {
          setJustAllowedFields(configuration[key].props, newItemOfArray, valueToReceiveChanges[key][indexInOldValue])
        }
      }

      const IdsFromTheClientSide = inputValue[key].map(nv => nv._id?.toString())
      valueToReceiveChanges[key] = valueToReceiveChanges[key].filter(ov => {
        return (!ov._id || newItems.includes(ov._id.toString()) || IdsFromTheClientSide.includes(ov._id.toString()))
      })
      continue
    }

    if (configuration[key].props) {
      valueToReceiveChanges[key] = valueToReceiveChanges[key] ?? {}

      setJustAllowedFields(configuration[key].props, inputValue[key], valueToReceiveChanges[key])
    }
  }
}

module.exports = setJustAllowedFields
