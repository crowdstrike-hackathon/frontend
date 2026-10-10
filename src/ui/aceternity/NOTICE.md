# Attribution

The components in this directory are from **Aceternity UI** (https://ui.aceternity.com),
installed from the project's official component registry. Aceternity UI's open-source
components are distributed under the MIT License.

Author: Manu Arora (@mannupaaji) and the Aceternity UI contributors.

Local adaptations are limited to import-path adjustments (`@/lib/utils` →
`../../lib/utils`) so the components resolve in this Create React App project, plus
`title` / `description` props and a transparent background on `Timeline`, and Tailwind v4
utilities in `TextFlippingBoard` rewritten as v3 arbitrary properties (its colour tiles also
stretch to the row instead of using a fixed aspect ratio, which widened their columns). `FloatingDock` is flipped to sit at the top of the page
(icons grow downward, tooltips and mobile menu open below) and its items accept `onClick`. `NavItems` in the resizable navbar accept a per-item
`onClick` and `active` flag; the navbar also has an always-on glass surface and a faster
resize spring (stock: stiffness 200, damping 50). `Globe3D` now honours its
`initialRotation` config (the shipped component declares it but never reads it). The
`SplitFlapBoard` and `widgets` files in this directory are original to this project and
not part of Aceternity UI.

Each vendored `.tsx` file starts with `// @ts-nocheck`: the components are used from plain
JavaScript here, and react-three-fiber's JSX typings otherwise break type-checking of
unrelated components.
