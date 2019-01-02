import { AbstractDownloader, DownloadParams } from './abstract'
import { compileTemplate } from '../../../../util/handlebars'
// type imports
import { URL } from 'url'
import { ScrapeConfig } from '../../../../configuration/site-traversal/types'
import { RunOptions } from '../../../../configuration/run-options/types'
import { Dependencies } from '../../../types'

type Headers = { [header: string]: string }
type DownloadData = [URL, { headers: Headers; method: string }]

class HttpDownloader extends AbstractDownloader {
  private urlTemplate: ReturnType<typeof compileTemplate>
  private headerTemplates: Map<string, ReturnType<typeof compileTemplate>>

  constructor(
    config: ScrapeConfig,
    runParams: RunOptions,
    dependencies: Dependencies
  ) {
    super(config, runParams, dependencies)
    this.urlTemplate = compileTemplate(config.download.urlTemplate)
    this.headerTemplates = new Map()
    Object.entries(config.download.headerTemplates).forEach(
      ([key, templateStr]) =>
        this.headerTemplates.set(key, compileTemplate(templateStr))
    )
  }

  constructDownload = ({ value, incrementIndex: index }: DownloadParams) => {
    const templateVals = { ...this.runParams.input, value, index }
    // construct url
    const url = this.urlTemplate(templateVals)
    // construct headers
    const headers: Headers = {}
    for (const [key, template] of this.headerTemplates) {
      headers[key] = template(templateVals)
    }
    return [url, { headers, method: this.config.download.method }]
  }

  retrieve = (
    downloadId: number,
    downloadParams: DownloadData
  ): { downloadValue: string; filename?: string } => {
    return { downloadValue: '', filename: '' }
  }
}
