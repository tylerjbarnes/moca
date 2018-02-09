export default {
    computed: {
        projects () {
            let projects = this.allProjects;
            if (this.$store.state.searchTerm && (projects.length < 80 || this.$store.state.searchTerm.length > 2)) {
                let options = {extract: (project) => project.name};
                projects = fuzzy.filter(this.$store.state.searchTerm, projects, options)
                    .map(result => result.original);
            }
            return projects;
        }
    }
}
