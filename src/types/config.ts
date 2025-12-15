export interface Config {
  /// Gscore的ws连接主机地址
  host: string
  /// Gscore的ws连接的端口
  port: number
}

export interface ConfigType {
  config: Config
}