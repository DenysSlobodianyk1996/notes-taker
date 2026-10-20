# Angular with Signal Forms and plain SCSS

The app is built with Angular 22 using standalone components, signals and zoneless change detection. Forms use Signal Forms (`@angular/forms/signals`), and styling is plain SCSS: no component library, no dark mode, and icons come from Material Symbols loaded through a Google Fonts `<link>`. We chose this because Angular is the owner's main stack and the UI is small enough that a component library would add more weight than value.

## Consequences

Signal Forms are newer than Reactive Forms, and their API may still change between Angular majors. Every form control has to be styled by hand.
