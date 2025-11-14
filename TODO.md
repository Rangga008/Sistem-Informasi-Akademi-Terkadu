# TODO: Implement Top Students Carousel on Search Page

- [ ] Add `topStudents` state to hold the top 10 students by project count in `web/src/app/search/page.tsx`
- [ ] Modify `loadInitialContent` to fetch top students from `/users/top-students?limit=10` alongside existing fetches
- [ ] Create a `renderTopStudentCard` function for smaller carousel cards
- [ ] Add horizontal carousel section above the projects grid, shown only when `!searchQuery`
- [ ] Style the carousel as a horizontal scrollable container using CSS flexbox with `overflow-x: auto`
- [ ] Ensure carousel is hidden during search and only projects/users search results are shown
- [ ] Test the implementation by running the web app and verifying carousel behavior
