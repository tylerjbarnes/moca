export default {
    computed: {
        persons () {
            let persons = this.allPersons;
            if (this.$store.state.searchTerm) {
                let options = {extract: (person) => person.name};
                persons = fuzzy.filter(this.$store.state.searchTerm, persons, options)
                    .map(result => result.original);
            }
            return persons;
        },
        managers () {
            return this.persons.filter( member => member.canManage);
        },
        contractors () {
            return this.persons.filter( member => member.role == 'contractor');
        },
        clients() {
            return this.persons.filter( member => member.role == 'client');
        }
    }
}
