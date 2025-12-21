import {
  copyConfigSync,
  karinPathBase,
  requireFileSync,
  watch,
  YamlEditor,
} from 'node-karin'

import { adapterName, adapterPath } from '@/root'
import type { ConfigType } from '@/types'

type ConfigDirType = 'config' | 'defSet'

class Cfg {
  /** 用户配置文件路径 */
  private dirCfgPath: string
  /** 默认配置文件路径 */
  private defCfgPath: string
  #configFile = 'config.yaml'

  constructor() {
    this.dirCfgPath = `${karinPathBase}/${adapterName}/config/`
    this.defCfgPath = `${adapterPath}/config/defSet/`
  }

  /** 初始化配置 */
  initCfg() {
    copyConfigSync(this.defCfgPath, this.dirCfgPath)

    const configFilePath = `${this.dirCfgPath}/${this.#configFile}`
    const defConfigFilePath = `${this.defCfgPath}/${this.#configFile}`
    
    const configEditor = new YamlEditor(configFilePath)
    const defConfigEditor = new YamlEditor(defConfigFilePath)

    const { differences, result } = this.mergeObjectsWithPriority(
      configEditor,
      defConfigEditor,
    )
    if (differences) result.save()

    /**
     * @description 监听配置文件
     */
    watch(configFilePath, (_old, _now) => {
      // logger.info('旧数据:', old);
      // logger.info('新数据:', now);
    })

    return this
  }

  /**
   * 获取默认配置和用户配置
   * @param name 配置文件名
   * @returns 返回合并后的配置
   */
  getDefOrConfig(): ConfigType {
    const def = this.getYaml('defSet')
    const config = this.getYaml('config')
    return { ...def, ...config }
  }

  /** 获取所有配置文件 */
  All(): ConfigType {
    return this.getDefOrConfig() as ConfigType
  }

  /**
   * 获取 YAML 文件内容
   * @param type 配置文件类型
   * @param name 配置文件名
   * @returns 返回 YAML 文件内容
   */
  private getYaml(type: ConfigDirType) {
    const file =
      type === 'config'
        ? `${this.dirCfgPath}/${this.#configFile}`
        : `${this.defCfgPath}/${this.#configFile}`

    return requireFileSync(file, { force: true })
  }

  /**
   * 修改配置文件
   * @param key 键
   * @param value 值
   * @param type 配置文件类型，默认为用户配置文件 `config`
   */
  Modify(
    key: string,
    value: any,
    type: ConfigDirType = 'config',
  ) {
    const filePath =
      type === 'config'
        ? `${this.dirCfgPath}/config.yaml`
        : `${this.defCfgPath}/config.yaml`

    const editor = new YamlEditor(filePath)
    editor.set(key, value)
    editor.save()
  }

  /**
   * 合并 YAML 对象，确保保留注释
   */
  mergeObjectsWithPriority(
    userEditor: YamlEditor,
    defaultEditor: YamlEditor,
  ): { result: YamlEditor; differences: boolean } {
    let differences = false

    const mergeYamlNodes = (targetPath: string, sourceEditor: YamlEditor) => {
      const sourceData = sourceEditor.get(targetPath)
      const targetData = userEditor.get(targetPath)

      if (typeof targetData === 'object' && typeof sourceData === 'object') {
        for (const key in sourceData) {
          if (!(key in targetData)) {
            differences = true
            userEditor.set(
              `${targetPath ? `${targetPath}.` : ''}${key}`,
              sourceData[key],
            )
          }
        }
      }
    }

    mergeYamlNodes('', defaultEditor)

    return { differences, result: userEditor }
  }
}

type Config = ConfigType & Pick<Cfg, 'All' | 'Modify'>

export const Config = new Proxy<Cfg & ConfigType>(
  Object.assign(new Cfg().initCfg(), {} as ConfigType),
  {
    get(target, prop: string) {
      if (prop in target) return Reflect.get(target, prop)
      return target.getDefOrConfig()[prop as keyof ConfigType]
    },
  },
)
