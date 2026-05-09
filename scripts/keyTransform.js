function detectKeyFormat(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return 'unknown';
  const first = arr[0];
  if (typeof first !== 'object' || first === null) return 'unknown';
  if ('__key' in first) return 'flat';
  if ('$id' in first && 'v' in first) return 'v';
  if ('$id' in first && 'value' in first) return 'value';
  return 'unknown';
}

function flatToWrapped(arr, wrapKey) {
  return arr.map(function(item) {
    const result = {};
    if ('__key' in item) result.$id = item.__key;
    if ('ts' in item) result.$ts = item.ts;
    const inner = {};
    for (const k in item) {
      if (k !== '__key' && k !== 'ts') inner[k] = item[k];
    }
    result[wrapKey] = inner;
    return result;
  });
}

function wrappedToFlat(arr) {
  return arr.map(function(item) {
    const result = {};
    if ('$id' in item) result.__key = item.$id;
    if ('$ts' in item) result.ts = item.$ts;
    const inner = item.v || item.value || {};
    for (const k in inner) result[k] = inner[k];
    return result;
  });
}

function rewrapKeys(arr, fromKey, toKey) {
  return arr.map(function(item) {
    const result = {};
    for (const k in item) {
      if (k === fromKey) result[toKey] = item[k];
      else result[k] = item[k];
    }
    return result;
  });
}
