# Graph Drawing Theory
## Importance of the Graph class in Graph Drawing
By Graph drawing is intended Automated Graph Drawing. Users drawing graphs by hand or design tools mostly yield a sattisfying result in comparision to an automated layout tool. In such circumstances, it is safe to assume that the failure in layout automation is a failure to understand the user's wish or probably use case.

Defining the class of the graph can greatly help defining multiple required settings and configuration that would provide a better drawing result. Drawing a UML sequence diagram as example, might require a different engine than a module dependency graph, which could be expected to be a directed Tree.

The Graph class is not always available. Some graphs might abstract or in between two classes. It is then practicle if it is possible to infer the class of the Graph solely from its characteristics. This would be then a Graph classification problem, which resolution could be considered half way of the resolution of the Graph Drawing problem.

## Importance of Vertices or Edges depending on the Graph class
When drawing a Graph, a drawing quality metric has first to be set, then resolved. When we have a molecular graph in mind, the nodes are not as important as the edges that represent the binding. In such graphs, edges are to be considered as First class citizen, and they do play a major role on defining the position of the vertices. In other Graph types such as sw modules dependencies or a social network, only the nodes have importance and the edge plays a secondary role, it's enough to be able to refer to one node from the other without loosing the visual connection path. Such Graphs could have a Node centric approach where playing neighboring nodes next to each other is of primary importance and drawing the connecting edges can be done at the end without impacting the layout algorithm.

## Viewport approaches (Map vs Filtering)
Some Graphs such as a sequence diagram could be read like a sentence. Only one dimension is then needed to fit in the viewport, and the other dimension can be scrolled.
Other than that particular examples, the Graph drawing problem is a two dimensional problem. The 3D initiatives can be considered as 2D as well given the projection on the screen or even with stereo, the projection on the users view that is two dimesional at the perception level.
It is possible to split the Graph drawing logic in two approaches: A map like approach with a bird view where the user only sees a portion of the Graph, this helps to build a mind map of the Graph that can leverage all reflexes of intuitive path finding to get back to any required graph location. Yet such a map could be so complex that it becomes overwhelming for the user and it end up sinking the useful information within the destructive completeness of the Graph. The second approach is a snapshot view of the required information only. This view has to be so simple that it does not require any map memory and it should provide right away the answer of the problem that pushed the user to query the Graph view. This view has therfore to fully fit in the user viewport, be it a horizontal browser window or a vertical smartphone screen or readable document. Taking the viewport dimension as input of the Graph drawing algorithm is therefore of primary importance.

Once the answer to the first question provided, a second question might arise and the Graph drawing problem turn then into a Graph exploration problem. The limited portion of the Graph represented in the viewport has then to Morph to adapt to the new request. Non required info should be hidden and the focus info should appear. This drawing problem is a Graph Filtering problem.

 - Mutations groups

### Graph classification references
* [Graph Classification using Structural Attention](https://www.kdd.org/kdd2018/accepted-papers/view/graph-classification-using-structural-attention)
* https://arxiv.org/pdf/1904.05003.pdf
* https://www.csc2.ncsu.edu/faculty/nfsamato/practical-graph-mining-with-R/slides/pdf/Classification.pdf
* 