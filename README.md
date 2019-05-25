<p align="center">
  <img width="60%" src="https://raw.githubusercontent.com/ExplorViz/Docs/master/images/explorviz-logo.png">
</p>

___

<a href="https://travis-ci.org/ExplorViz/explorviz-frontend"><img src="https://travis-ci.org/ExplorViz/explorviz-frontend.svg?branch=master" alt="Build Status"></a>
<a href="https://david-dm.org/ExplorViz/explorviz-frontend/master"><img src="https://david-dm.org/ExplorViz/explorviz-frontend/master/status.svg" alt="Dependency Status"></a>
<a href="https://david-dm.org/ExplorViz/explorviz-frontend/master?type=dev"><img src="https://david-dm.org/ExplorViz/explorviz-frontend/master/dev-status.svg" alt="devDependencies status"></a>

## Project Description
ExplorViz uses dynamic analysis techniques to provide live trace visualization of the communication in large software landscape. It targets system and program comprehension in those landscapes while still providing details on the communication within an application. A landscape perspective enriches current system visualizations with additional abstraction levels for efficient comprehension of communication between hundreds of applications which is often encountered in, for instance, Cloud environments. On the application level perspective, ExplorViz utilizes the 3D city metaphor combined with an interactive concept of showing only details that are in focus of the analysis. For best accessibility, ExplorViz is a web-based tool featuring cutting-edge technologies like WebGL and HTML 5.

Given the 3D city metaphor visualization of an application, we investigate new interaction styles and higher immersion for a more effective and efficient program comprehension process. For this purpose, we utilize uprising technologies and evaluate developed approaches in experiments with real test subjects.

The usability and effectiveness of ExplorViz has been investigated in controlled experiments which resulted in increased efficiency and effectiveness over competing approaches.

This project is a WIP replica of ExplorViz's visualization component. It substitutes [GWT](http://www.gwtproject.org/) client-code with [EmberJS](https://www.emberjs.com/). This is only the frontend, you will need the [backend](https://github.com/ExplorViz/explorviz-backend) as well for production. However, you can mock the backend as shown in the development section below.

## Reference
How to cite ExplorViz:

Florian Fittkau, Alexander Krause, Wilhelm Hasselbring (2017): Software landscape and application visualization for system comprehension with ExplorViz. Information and Software Technology, Volume 87. pp. 259-277. DOI https://doi.org/10.1016/j.infsof.2016.07.004.

[[BibTex]](http://eprints.uni-kiel.de/cgi/export/eprint/33464/BibTeX/cau-eprint-33464.bib) | [[Endnote]](http://eprints.uni-kiel.de/cgi/export/eprint/33464/EndNote/cau-eprint-33464.enw)
## Documentation
The API documentation is available [here](https://explorviz.github.io/explorviz-frontend/).

## Deployment
Use our Docker images as described in our [Wiki](https://github.com/ExplorViz/docs/wiki).

## Development
### Prerequisites
You will need the following things properly installed on your computer.

* [Git](http://git-scm.com/)
* [Node.js](http://nodejs.org/) with NPM (currently 11.8.0 / npm 6.5.0)

### Installation (Generic)
* `git clone <repository-url>` this repository
* `cd explorviz-frontend`
* `npm install -g ember-cli`
* `npm install`

### Running / Development
* `ember serve` or `ember s`
* Visit the frontend at [http://localhost:4200](http://localhost:4200).

### Mocking the Backend
You can mock the backend, for example if you don't need live data for your development (or as showcase).
Therefore, you are not required to download and run the ExplorViz Backen Java project.
To achieve this, run the frontend with `ENABLE_MOCK=true ember s --environment=mocked`.

#### Testing
* `npm test` or `ember test` / `ember test --server`

#### Building
* `npm build` or `ember build` (development) / `ember build --environment=production` (production)
