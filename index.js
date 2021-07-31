'use strict'

const setJustAllowedFields = (configuration, newValue, oldValue) => {
  if (typeof newValue !== 'object') {
    return
  }

  for (const key of Object.keys(configuration)) {
    const newValueHasTheKey = Object.keys(newValue).includes(key)

    if (!newValueHasTheKey) {
      continue
    }

    if (configuration[key] === 'target') {
      oldValue[key] = newValue[key]
      continue
    }

    if (configuration[key].objectArray) {
      if (!newValue[key]) {
        oldValue[key] = newValue[key]
        continue
      }

      oldValue[key] = oldValue[key] || []
      const newItems = []

      for (let newItemOfArray of newValue[key]) {
        const indexInOldValue = oldValue[key].findIndex(item => {
          return newItemOfArray._id && item._id.toString() === newItemOfArray._id.toString()
        })

        if (indexInOldValue < 0) {
          oldValue[key].push({})

          const oldValueLength = oldValue[key].length - 1

          setJustAllowedFields(configuration[key].props, newItemOfArray, oldValue[key][oldValueLength])
          newItems.push(oldValue[key][oldValueLength]?._id?.toString())
        } else {
          setJustAllowedFields(configuration[key].props, newItemOfArray, oldValue[key][indexInOldValue])
        }
      }

      const IdsFromTheClientSide = newValue[key].map(nv => nv._id?.toString())
      oldValue[key] = oldValue[key].filter(ov => {
        return (!ov._id || newItems.includes(ov._id.toString()) || IdsFromTheClientSide.includes(ov._id.toString()))
      })
      continue
    }

    if (configuration[key].props) {
      oldValue[key] = oldValue[key] ?? {}

      setJustAllowedFields(configuration[key].props, newValue[key], oldValue[key])
    }
  }
}

module.exports = setJustAllowedFields
