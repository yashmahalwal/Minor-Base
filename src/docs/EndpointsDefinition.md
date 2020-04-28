# Endpoints - Semantics and Cases

  

This section lays the theoretical foundation for our discussion of endpoints. You describe endpoints and their working using concepts from this section.

  

  

## Introduction

  

The very foundation of RESTful architecture lies in the semantics of the endpoints of the API. The reason we can perform autonomous testing on RESTful APIs is because the semantics are a standard and are more or less uniform. That in turn provides a robust and stable structure. In Layman's terms,

  

  

> Since RESTful APIs have a fixed structure and associated semantics, a lot of things are standardised and fixed. That makes it possible for us to generate test cases and provide high coverage

  

  

We now discuss how we interpret those semantics. That will help you write better API descriptions and also understand how our tests work.

  

  

## Endpoint

  

Endpoint is an entry point for the API. Any communication to the API will be made via the endpoints it provides. Endpoint is a part of the URL. As per REST, endpoint decides the type of resource that is to be selected. The rest of URL helps identify the resource instance

  

  

    URL: /Student/171112275
    Endpoint: /Student

  

For more about Endpoints and URLs and how we use them, read the [section].

  

  

## Method

  

With URL, you target a resource instance. Method is a HTTP verb that describes what you intend to do with the resource

  

  

## Case

  

This isn't exactly a REST term. We use case to describe a combination of Endpoint, URL, method, request and response. It is similar to a function declaration where you describe the input and output of the function.

  

  

When an **endpoint** is hit with a given **URL** and a given **request body** (not for GET and DELETE methods), three things can happen. Each of the three outcomes is called a case. Each case describes a possible outcome of hitting the API with given set of endpoint, url and request body. Below are the three cases with their generic meanings:

  

  

-  ***Positive***: The method was used as it was intended

  

-  ***Negative***: The method was used for an illegal operation, which isn't logically possible.

  

-  ***Destructive***: The API was hit in an incorrect way and not as it was supposed to

  

We discuss each case along with the appropriate method. Note that this case is not same as a test case. Whenever we mean test case, we explicitly mention so. Otherwise, all mentions to a case are refer to the above discussion.

  

> If two different operations on a given resource are of the same method, they are treated equivalent. For example, if you have two **GET** methods defined on same resource but with different endpoint and url, they are treated as different ways of doing the same thing. If the methods are called GET-0 and GET-1, they only differ in how they are invoked and can be used interchangeably. GET-0 positive and GET-1 positive are essentially equivalent cases.

  

## GET

  

  

`GET` method is used to retireve a given resource from the server. `GET` requests do not have a body. They only have a URL which is used to get the resource instance from the server.

  

  

### *Positive*

  

Trying to get a resource instance that exists on the server.

  

  

### *Negative*

  

Trying to get a resource instance that does not exist on the server.

  

  

## PUT

  

`PUT` method is used to put a given resource on the server. If it already exists on the server, the old instance is replaced with the current one. Otherwise, a new resource instance is created on the server. The said instance is sent via `PUT` request body.

### *Positive*

  

Trying to put a valid resource instance on the server.

  

### *Destructive*

  

Trying to put an invalid resource instance on the server.

  

## POST

  

  

`POST` method is used to create new resource instance on the server. The said instance is sent via `POST` request body.

### *Positive*

  

Trying to create a valid resource instance on the server which does not already exist.

### *Negative*

  

Trying to create a valid resource instance on the server which already exists.

  

### *Destructive*

  

Trying to create an invalid resource instance on the server.

  

  

## DELETE

  

`DELETE` method is used to delete a given resource from the server. `DELETE` requests do not have a body. They only have a URL which is used to delete the resource instance from the server.

  

### *Positive*

Trying to delete a resource instance that exists on the server.

### *Negative*

Trying to delete a resource instance that does not exist on the server.

## PATCH

  

  

`PATCH` method is used to partially update a given resource from the server. The fields to be updated are expressed in the request body.

  

### *Positive*

  

Trying to correctly update a resource instance that exists on the server.

  

  

### *Negative*

  

Trying to correctly update a resource instance that does not exist on the server.

  

  

### *Destructive*

  

Trying to incorrectly update a resource instance. That means that either non existent fields are asked to be updated (invalid fields) or the fields are asked to be updated with invalid data (invalid values).