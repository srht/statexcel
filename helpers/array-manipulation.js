const transpose = arr => arr.reduce((m, r) => (r.forEach((v, i) => {
    if (!m[i]) m[i] = []; else m[i].push(v);
}), m), [])

const onlyUnique=(value, index, self)=>self.indexOf(value)===index;

module.exports={
    transpose, onlyUnique
}