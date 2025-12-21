import { components, defineConfig } from 'node-karin'
import { Config } from '@/common'

export default defineConfig({
  info: {
    id: '@puniyu/karin-adapter-gscore',
    name: 'karin-adapter-gscore',
    author: {
      name: 'puniyu',
      home: 'https://github.com/puniyu',
      avatar: 'https://avatars.githubusercontent.com/u/218100055?s=200&v=4',
    },
  },
  /** 动态渲染的组件 */
  components: () => [
    // 基本调用方法
    components.accordion.create('gscore', {
      label: 'GeCore Adapter 配置',
      children: [
        components.accordion.createItem('config', {
          title: '配置',
          subtitle: '配置适配器设置',
          children: [
            components.input.string('host', {
              label: 'Gscore的主机地址',
              defaultValue: Config.host,
              isClearable: true,
              isRequired: true,
              rules: [
                {
                  regex:
                    /^(localhost|127\.0\.0\.1|(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)|(?:(?:[a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*(?:[A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9]))$/,
                  error: '请输入有效的主机地址',
                },
              ],
            }),
            components.input.number('port', {
              label: 'Gscore的端口',
              defaultValue: String(Config.port),
              isClearable: true,
              isRequired: true,
              rules: [
                {
                  min: 1,
                  max: 65535,
                  error: '端口应在1-65535之间',
                },
              ],
            }),
            components.switch.create('wss', {
              label: '是否开启wss',
              description: '是否开启wss, 开启后使用wss://连接',
              defaultSelected: Config.wss,
            }),
          ],
        }),
      ],
    }),
  ],

  /** 前端点击保存之后调用的方法 */
  save: (config: any) => {
    console.log('config', config)
    const { host, port, wss } = config.gscore[0]
    Config.Modify('host', host)
    Config.Modify('port', Number(port))
    Config.Modify('wss', Boolean(wss))
    return {
      success: true,
      message: '保存成功',
    }
  },
})
