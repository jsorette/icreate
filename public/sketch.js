colors = []
gardens = []

setup = () => {

}

onColorsChanged = () => {
    gardens = data.filter(garden =>
        (garden[".Serres"] && colors.includes('yellow'))
        || (garden[".Médic"] && colors.includes('green'))
        || (garden[".Spon"] && colors.includes('blue'))
        || (garden[".Exotic"] && colors.includes('red'))
    )
    console.log(colors);
    console.log(gardens.length);
}