const { people } = require('../data')


const getPeople = (req, res) => {
    res.status(200).json({ success: true, data: people });
}


const createPerson = (req, res) => {
    const { name } = req.body
    if (!name) {
        return res.status(400)
            .json({ success: false, msg: "Please provide a name" })
    }
    // adds the person to the json list
    people.push({
        id: people.length + 1, name: name
    })

    res.status(201).send({ success: true, person: name })
}


const createPersonPostman = (req, res) => {
    const { name } = req.body
    if (!name) {
        return res.status(400)
            .json({ success: false, msg: "Please provide a name" })
    }
    res.status(201).send({ success: true, data: [...people, name] })

}

const updatePerson = (req, res) => {
    const { id } = req.params
    const { name } = req.body
    const person = people.find((person) => person.id === Number(id))

    if (!name) {
        return res
            .status(404)
            .json({ success: false, msg: `Their is no one with the name ${name}` })
    }

    const newPeople = people.map((person) => {
        if (person.id === Number(id)) {
            person.name = name
        }
        return person
    })
    res.status(200).json({ success: true, data: newPeople })
}

const deletePerson = (req, res) => {
    const person = people.find((person) => person.id === Number(req.params.id))
    if (!person) {
        return res
            .status(404)
            .json({ success: false, msg: `no person with id ${req.params.id}` })
    }
    const newPeople = people.filter((person) => person.id !== Number(req.params.id));
    return res.status(200).json({ success: true, data: newPeople })
}

module.exports = {
    getPeople,
    createPerson,
    createPersonPostman,
    updatePerson,
    deletePerson,
}