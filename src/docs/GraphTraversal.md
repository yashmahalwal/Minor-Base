# Endpoint graph and its traversal
We have seen the concept of endpoints. We also saw what various cases are possible and what they stand for. But then testing a case in isolation isn't enough. Real world use case for an API is not a single operation but instead a sequence of operations. For example, a **get** request that yields a resource from server can be followed by a **patch** request to update it and then **delete** request to delete it.  We test the API by performing multistep operations. In order to do so, we make a graph and traverse it to extract all possible paths. This section discusses how that graph. This is the core of our test case generation algorithm and an understanding of this might help you with providing better descriptions of your API.
## Nodes of the graph
Based on your description of the API, we extract all the possible cases. Then by the semantics of those cases, we make a graph. Each node of the graph denotes a case and its type is identified by the method and type of outcome. For example,  take the following case:

    Endpoint: /Student
    URL: /Student/:id
    METHOD: GET
    TYPE: POSITIVE
 This case is represented by a node of **type**
 

    method: GET, key: POSITIVE
This is actually how we label nodes internally. Index is used to number nodes of similar types. For example, imagine that there are multiple equivalent cases,

    1. 
    Endpoint: /Student
    URL: /Student/:id
    METHOD: GET
    TYPE: POSITIVE
    Expected response: status: 200, body: Resource
    
    2.
    Endpoint: /Student
    URL: /Student/:name
    METHOD: GET
    TYPE: POSITIVE
    Expected response: status: 200, body: Resource
Above two cases are equivalent, So they both are represented by nodes of same type. Their **names** are:

    1. method: GET, key: POSITIVE, index: 0
    2. method: GET, key: POSITIVE, index: 1

  We make an object with appropriate field and serialize it to `JSON` string to label the node in the graph. Each node name is a string identifier.
## Edges
We have seen that each node represents a case. Visiting a node represents testing the corresponding case. If we were to test cases in isolation, we would just visit every node and be done with testing. But if we are to perform multistep testing, we visit a sequence of nodes. That represents testing a sequence of cases. We can start with any node. But to go to the next step, we need to know what nodes we can move to.

For example, say we test the **positive post** case. That is, you successfully create a resource instance on the server. After this, you cannot expect another **positive post** case for the same resource. In other words, you cannot successfully create a resource on server which already exists there. You can expect a **negative post** case which means trying to create the same instance will fail with an appropriate error code. 

It is crucial to know what nodes can be traversed after a given node. For that, we have edges. An edge from a node to another node means that we can visit the second node after the first one. We will see how edges are made later. For now, it is enough to understand that they stand for a possible movement between nodes.
## Walking the graph
Now we get to the interesting part. To traverse the graph, we walk along it. We start by visiting a node (any node). After visiting that node, we check if the visit was successful (i.e., the case behaved as it should've). If happens, we check all the edges coming out of the node and pick one to go to the next node. And we repeat the same with the next node.

At the beginning of our walk, we have a resource instance. That instance is randomly generated using resource description. We pass over various nodes and each node updates the instance as per its action. For example, **patch positive** updates the fields of the resource as instructed. Now our resource instance is updated. For all consecutive nodes, we use this instance and not the original instance. A **get positive** now should successfully retrieve the updated instance and the not the original instance.

Each walk represents a test case and visiting a node is taking a step in the walk and hence testing a step in our multistep test case.
### ***Visiting a node***
 At each node in our walk, we roughly take the following actions:
1. Create the URL and request body using the given resource instance
2. Hit the API with that URL and request.
3. Read and interpret the response.
4. If the response was as expected, update our resource instance to reflect the changes. We use this updated resource for subsequent nodes.
6. If the response was not as expected, the step fails and so does the test case as a whole

There is an additional step to this process. But for now, this is enough. We shall see that step when we discuss destructive cases. To change the resource instance, we see the case - essentially the method and case's type. That helps us understand what has happened and we update our local copy of the resource instance to reflect the updated copy on the server.

### ***Summary***
The following things happen when perform testing on the API:
1. We read the API description and extract nodes from it.
2. We link the appropriate nodes by making directed edges between them. 
3. We start from any given node and visit it. After a successful visit, we pick an edge and move the the node at the end of it
4. We keep on repeating this process to perform multistep testing

Some minor details of this algorithm are:
1. ***Maximum Walk length***: There might be loops in the graph. So a walk is not guaranteed to end. Instead, we stop walking after a given number of steps as specified in the tool configuration. If max steps is 4, we traverse all possible walks of length 1, 2, 3 and 4. 
2.  ***Iterations***: Resource is made with random data. Resource, request and response may have a variable structure. So, we run each test case (walk) multiple times with different data. Number of iterations is specified in the tool configuration. Number of iterations depend on variance of structures in your API.
3. ***Setup***: Before running each test case, we initialise the server state by putting some resource instances on the server.  Number of instances used and the method used for setup is decided by the configuration.
4. ***Test points***: This refers to total number of visitations that will be made on traversing the graph. They grow exponentially with number of steps and iterations. Hence, proceed only if it is feasible to test the given number of points

## Edge generation
Now we discuss how edges are made. This is a simple hard coded algorithm and is mentioned for the sake of transparency. It can be referred for debugging purposes.

This is a naive algorithm. We take each node one by one and see what nodes can be moved to after this one. That is decided by semantics of the nodes. Nodes with same semantics (nodes of same type) are considered equivalent. Below we list the types of source nodes and then list the possible target node types. When we consider a node type, we consider all the nodes of that type together. 

For example, when we are at a node type of **post positive**, we can move to **post negative**. That means that we make an edge from each node of post positive type to all nodes of post negative type.

Now we list the source nodes and possible target nodes. They are the possible edges in our graph. We see the available nodes and make the graph. We only discuss sequence of positive and negative cases. Destructive cases are treated differently and we will see how we integrate testing them into the process.


***GET***
 **Positive**: You retrieved a resource from server successfully. That implies that the resource exists on the server. 

 - Method: GET, key: POSITIVE
 - Method: DELETE, key: POSITIVE
 -  Method: PUT, key: POSITIVE
 -  Method: POST, key: NEGATIVE
 - Method: PATCH, key: POSITIVE

 **Negative**: You tried to retrieve a resource from server but failed. That implies that the resource does not exist on the server. 

 - Method: GET, key: NEGATIVE
 - Method: DELETE, key: NEGATIVE
 -  Method: PUT, key: POSITIVE
 -  Method: POST, key: POSITIVE
 - Method: PATCH, key: NEGATIVE

***DELETE***
 **Positive**: You deleted a resource from server successfully. That implies that it was there before but now it isn't.

 - Method: GET, key: NEGATIVE
 - Method: DELETE, key: NEGATIVE
 -  Method: PUT, key: POSITIVE
 -  Method: POST, key: POSITIVE
 - Method: PATCH, key: NEGATIVE

 **Negative**: You tried to retrieve a resource from server but failed. That implies that the resource did not exist on the server. It still doesn't

 - Method: GET, key: NEGATIVE
 - Method: DELETE, key: NEGATIVE
 -  Method: PUT, key: POSITIVE
 -  Method: POST, key: POSITIVE
 - Method: PATCH, key: NEGATIVE

***PUT***
 **Positive**: You could successfully put a resource on the server. Maybe it was there. Maybe it wasn't. But now it is.

 - Method: GET, key: POSITIVE
 - Method: DELETE, key: POSITIVE
 -  Method: PUT, key: POSITIVE
 -  Method: POST, key: NEGATIVE
 - Method: PATCH, key: POSITIVE

***POST***
 **Positive**: You successfully created a new resource on the server.

 - Method: GET, key: POSITIVE
 - Method: DELETE, key: POSITIVE
 -  Method: PUT, key: POSITIVE
 -  Method: POST, key: NEGATIVE
 - Method: PATCH, key: POSITIVE

 **Negative**: You tried to create a resource on the server but failed. That implies that the resource already existed on the server. It still does.

 - Method: GET, key: POSITIVE
 - Method: DELETE, key: POSITIVE
 -  Method: PUT, key: POSITIVE
 -  Method: POST, key: NEGATIVE
 - Method: PATCH, key: POSITIVE

***PATCH***
 **Positive**: You successfully updated an existing resource on the server.

 - Method: GET, key: POSITIVE
 - Method: DELETE, key: POSITIVE
 -  Method: PUT, key: POSITIVE
 -  Method: POST, key: NEGATIVE
 - Method: PATCH, key: POSITIVE

 **Negative**: You tried to update a resource on the server but failed. That implies that the resource does not exist on the server.

 - Method: GET, key: NEGATIVE
 - Method: DELETE, key: NEGATIVE
 -  Method: PUT, key: POSITIVE
 -  Method: POST, key: POSITIVE
 - Method: PATCH, key: NEGATIVE

## Detailed node visitation algorithm
This section discusses what happens on visiting a node i.e., what happens when we test a case. The following actions are taken: 
1. Read the case and extract Endpoint, URL, method, request body if any and expected resource body. Based on the method and key - NEGATIVE or POSITIVE, we decide the semantic of the case. 
2. At the beginning of each step, we have an instance. We use that instance to generate the URL, request body (if any) and the expected response for the case. 
3. Now we hit the API as per the case describes. We take the response recieved and the expected response. That includes the status code and response body. We then compare it to the expected response based on the API description.
4. If the results match, the step was successful and we proceed. Otherwise, the step fails and so does the test case as a whole.
5. If the case key was positive, we take the URL, request body and response respectively and reconstruct the resource. That helps us get the updated resource. We use this instance for the next step.
6. If the case key was negative, we take the instance recieved as it is and pass it to the next step.
7. Before exiting the node, we also test the node destructively. We distort the request body and send it to the server. So desctructive tests are performed at each step, in isolation. That is in accordance with the semantics.
8. Now we choose an outgoing edge and visit a new node. After exhausting that path, we come back and choose next edge. We do that till all the edges are exhausted.
9. If there is no edge, the test case terminated.
10. We explore all the paths emerging from the node. There are loops in the graph and if we keep on exploring, then there is a high chance of being stuck in a cycle. We want to traverse the cycle too, as it is a possible use case. So we use a controlling argument that we determines the maximum walk length. On any walk, we do not explore more nodes than that. A practical value is 4.

## Gathering all the paths of a given maximum length
That is done in a DFS manner.  The following algorithm is used:

***Internal representation***: A walk is a sequence of nodes. (A true theorist would say that it is an alternating sequence of nodes and edges. But since there is a maximum of one edge between any two nodes, it is safe to say that walk is a sequence of nodes). We internally represent a walk by an array of node names. A walk of length `n` is actually an array of length `n`. A walk of max length `n` can be an array of `1 <= length <= n`. All  walks of max length `n-1` from a given node is an array of all possible walks - Array of Array of strings. Each entry of a walk array is of `1 <= length <= n`.

***Algorithm***: 
1. Visit each node. For every node, if the number of max steps (max walk length) is 1, return an array which contains an array which contains a single entry, the given node - `[[node]]`. This means that there is only one walk possible from this node. That walk contains only one step, the node itself.
2. If max walk length is `n > 1`, get all the adjacent nodes of this node. Visit each adjacent node. For each neighbour node, find walks of max length of `n - 1`. From each node, we get an array of walks of length `n - 1`. We take each entry (walk) and prepend it with the current node. Now we have all the walks from the current node of length `n`.
3. This way, we have exhausted all the possible walks of max length `n` from our given node. If you can follow, this is a DFS approach.
4. If there are no neighbours, return an array which contains an array which contains a single entry, the given node - `[[node]]`.

If you look at the algorithm, there are two base cases and the rest is recursion. If you look at the code: 
```typescript
function traverse(node, maxStep = 1){
	// An array of neighbouring nodes
	const neighbours = node.adjacent(); 
	
	// Bases
	if(maxStep === 1 || neighbours.length === 1)
		return [[node]];
	
	
	// An array of possible walks from given node
	const walks = [];
	for(const neighbour of neighbours){
		// Get all walks of max length: n - 1 from neighbour
		const _walks = traverse(neighbour, maxStep - 1);
		// Perpend each walk with our given node
		for(const walk of _walks)
			walks.push([node, ...walk]);
	}
	return walks;
}

function makeAllPaths(graph, maxSteps = 1){
	// An array of all the nodes
	const nodes = graph.nodes();
	const walks = [];
	for(const node of nodes) walks.push(...traverse(node));
	return walks;
}
```

   
     