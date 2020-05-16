# graphysics
Graph with Physics, No nodes overlap, morph nodes to properties and groups

# Live demo
https://networkgraphs.github.io/graphysics/

# Features

# Features details
* Update Graph
  * startup Demo
* stochastic centrality placement
* Mouse actions
  * highlight neighbors
  * drag node
* edges
  * labels on path

# Features Plan
* Update Graph
  * Right click and select samples
  * Drag and drop .graphml .Graphson
  * Query Gremlin server
* svg full screen
  * vertices menu
  * context menu
* Mouse actions
  * bring neighbors closer
  * reference node centrality layout of the whole graph
  * reference node / edge Gremlin query
* Swap between :
  * proprties
  * nodes
  * groups
* Hierarchical and cross Grouping

## Plan details
* edges with polylines and arrows
* multi-edges
* graph direction placement left to right for edge labels read

# Development details
* Matter js as physics engine
* svr render base, no update

# References
Follow project up from [NetworkGraphs/graph2d](https://github.com/NetworkGraphs/graph2d)
## SVG CSS
* http://tinkerpop.apache.org/docs/3.4.4/dev/io/#graphson
* [SVG w3.org](https://www.w3.org/TR/SVG/Overview.html)
* [SVG Filters](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/filter)
* [SVG Animations](https://svgwg.org/specs/animations/)
* [CSS Filters](https://developer.mozilla.org/en-US/docs/Web/CSS/filter)

## Graph javasctipt libraries
* [Cytoscape](https://js.cytoscape.org/) : Graph theory (network) library for visualisation and analysis
* [Sigma.js](http://sigmajs.org/) : Sigma is a JavaScript library dedicated to graph drawing. It makes easy to publish networks on Web pages, and allows developers to integrate network exploration in rich Web applications.
