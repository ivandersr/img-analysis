'use strict'
const { get } = require('axios')
class Handler {
  constructor({ rekogService, translatorService }) {
    this.rekogService = rekogService
    this.translatorService = translatorService
  }

  async detectImageLabels(buffer) {
    const result = await this.rekogService.detectLabels({
      Image: {
        Bytes: buffer
      }
    }).promise()

    const workingItems = result.Labels.filter(({Confidence}) => Confidence > 80)

    const names = workingItems
      .map(({Name}) => Name)
      .join(' and ')

    return { workingItems, names }
  }

  async translateText(text) {
    const params = {
      SourceLanguageCode: 'en',
      TargetLanguageCode: 'pt',
      Text: text
    }

    const { TranslatedText } = await this.translatorService.translateText(params).promise()
    return TranslatedText.split(' e ')
  }

  formatTextResults(texts, workingItems) {
    const finalText = []
    for (const index in texts) {
      const nameInPtbr = texts[index]
      const confidence = workingItems[index].Confidence
      finalText.push(
        ` ${confidence.toFixed(2)}% de ser do tipo ${nameInPtbr}`
      )
    }

    return finalText.join('\n')
  }

  async getImageBuffer(imageUrl) {
    const response = await get(imageUrl, {
      responseType: 'arraybuffer'
    })
    const buffer = Buffer.from(response.data, 'base64')
    return buffer
  }

  async main(event) {
    try {
      const { imageUrl } = event.queryStringParameters 
      // const imgBuffer = await readFile('./images/test.jpg')
      console.log('Downloading image...')
      const buffer = await this.getImageBuffer(imageUrl)
      console.log('Detecting labels...')
      const { workingItems, names } = await this.detectImageLabels(buffer)
      console.log('Translating...')
      const text = await this.translateText(names)
      console.log('Handling final object...')
      const finalText = this.formatTextResults(text, workingItems)
      console.log('Finishing...')
      return {
        statusCode: 200,
        body: `A imagem tem\n`.concat(finalText)
      }
    } catch (err) {
      console.log('Error**', err.stack)
      return {
        statusCode: 500,
        body: 'Internal server error!'
      }
    }
  }
}

// factory
const aws = require('aws-sdk')
const rekog = new aws.Rekognition()
const translator = new aws.Translate()
const handler = new Handler({
  rekogService: rekog,
  translatorService: translator
})

exports.main = handler.main.bind(handler)
