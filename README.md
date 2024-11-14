# Image analysis with serverless framework

This is an example of a service that utilizes AWS Rekognition to analyse an image, supported by AWS Translator to translate the results to portuguese.
It accepts an `imageURL` as a query string parameter and returns the highest matches the service detects for the given image, as the example below.

```
A imagem tem
 97.71% de ser do tipo Animal
 97.71% de ser do tipo gato
 97.71% de ser do tipo gatinho
 97.71% de ser do tipo mamífero
 97.71% de ser do tipo animal de estimação
 95.92% de ser do tipo abissínio
```

The service is provided as a factory pattern, creating instances of the related AWS services.
