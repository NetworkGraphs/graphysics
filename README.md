# graphysics
Graph with Physics, No nodes overlap, morph nodes to properties and groups

# Live demo
https://networkgraphs.github.io/graphysics/

# Features
What is already available
* Layout
  * stochastic cost driven centrality placement
  * Nodes physical collisions, no overlap
  * Neighborhood interaction forces
  * step by step demo layout with colred cost samples
* SVG
  * shadows and light filters
  * inline html and css with classes
* Mouse and Touch
  * Drag Node position with touch
  * Context menu (touch empty area, then second touch on Node)
  * Hover states with touch Node then touch empty area
* Update Graph
  * Drag and drop .graphml and .json in Graphson Format

## Features Details
* Node
  * hover : highlight neighbors
  * drag node
* Node context menu
  * pin / unpin
  * re-layout pinning current node
* edges
  * layout with distance to edges cost
  * labels on path
  * edges arrows (on box-line intersection)
  * labels text path adapts to keep text upwards
  * multi edges support
* Layout Forces
  * Keep Nodes horizontal
  * bring neighbors closer

# Plan
What is planned to be implemented in the Future
* Grouping
  * Hierarchical
  * cross Grouping
* Swap between :
  * proprties
  * nodes
  * groups
* Properties visualisation
  * shape
  * color
  * light
  * filter effect
* Update Graph
  * Query Gremlin server
* Global hierarchical context menu
  * text input for queries
* Update Graph
  * reference node / edge Gremlin query
* Mouse and Touch
  * Pan zoom whole graph
  * Zoom vertices labels
* Performance
  * Analysis
  * Acceleration (wasm)

## Plan Details
* configure sampling number (in config file)
* polyline edges (complex concept, unclear and improvement might not be noticable)
Style in js :
* collect muliple css rules in one litteral string


# Development
* Physics engine : Matter.js
* SVG : Raw, no libraries, only trensparent utils

## Limitations and issues
* centrality algo does not necessarily match neighborhood propagation which could result in cross edges cost inconsistencies

# References
Follow project up from [NetworkGraphs/graph2d](https://github.com/NetworkGraphs/graph2d)
## SVG CSS
* http://tinkerpop.apache.org/docs/3.4.4/dev/io/#graphson
* [SVG w3.org](https://www.w3.org/TR/SVG/Overview.html)
* [SVG Filters](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter)
* [SVG Animations](https://svgwg.org/specs/animations/)
* [CSS Filters](https://developer.mozilla.org/en-US/docs/Web/CSS/filter)

## Graph tools and libraries
### Javascript
* [Cytoscape](https://js.cytoscape.org/) : Graph theory (network) library for visualisation and analysis
* [Sigma.js](http://sigmajs.org/) : Sigma is a JavaScript library dedicated to graph drawing. It makes easy to publish networks on Web pages, and allows developers to integrate network exploration in rich Web applications.
### Java
* [Gephi](https://gephi.org/) : State of the art graph editing and analysis, focus on big graphs

