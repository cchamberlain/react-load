import createSpinner from './components/createSpinner'

const validate = dependencies => {
  const { assert, Promise, System, React } = dependencies
  if(!assert) throw new Error('dependency: must supply "assert" (chai.assert recommended)')
  assert.ok(Promise, 'dependency: must supply "Promise" (bluebird recommended)')
  assert.ok(System, 'dependency: must supply "System" loader (systemjs / jspm)')
  assert.ok(React, 'dependency: must supply "React"')
  return { assert, Promise, System, React }
}

export default dependencies => {
  const { assert, Promise, System, React } = validate(dependencies)

  const { Component, PropTypes } = React
  assert
  const IS_BROWSER = typeof window === 'object'

  const Spinner = createSpinner(React)

  return class Load extends Component {
    static propTypes =  { transpiler: PropTypes.string.isRequired
                        , depCache: PropTypes.object.isRequired
                        , meta: PropTypes.object.isRequired
                        , universalImports: PropTypes.object.isRequired
                        , serverImports: PropTypes.object.isRequired
                        , browserImports: PropTypes.object.isRequired
                        , renderFactory: PropTypes.func.isRequired
                        , moduleProps: PropTypes.object
                        };
    static defaultProps = { transpiler: 'plugin-babel'
                          , depCache: {}
                          , meta: { format: 'esm'
                                  , '*.js': { babelOptions: { presets:  [ 'stage-0' ]
                                                            }
                                            }
                                  }
                          , universalImports: {}
                          , serverImports: {}
                          , browserImports: {}
                          , renderFactory: Modules => props => {
                              const names = Object.keys(Modules)
                              if(names.length === 0)
                                return (
                                  <div style={{ color: '#f00', textAlign: 'center' }}>
                                    <h2>react-load: must specify a module to load.</h2>
                                    <div style={{marginLeft: '10%', marginRight: '10%', textAlign: 'left'}}>
                                      <code><pre>
                                      {`
import { assert } from 'chai'
import Promise from 'bluebird'
import System from 'systemjs'
import React from 'react'
import ReactLoad from 'react-load'

const Load = ReactLoad({ assert, Promise, System, React })

export default props => (
  <Load
      universalImports={{_: 'lodash'}}
      serverImports={{fs: 'fs'}}
      browserImports={{$: 'jquery'}}
      renderFactory={({_, fs, $}) => /* continuation logic */ }
  />
)

                                      `}
                                      </pre></code>
                                    </div>
                                    <Spinner color="#f00" />
                                  </div>
                                  )
                              if(names.length === 1) {
                                const Module = Modules[names[0]]
                                return <Module {...props} />
                              }
                              return <div>{Modules.map((Module, i) => <Module {...props} key={i} />)}</div>
                            }
                          , moduleProps: {}
                          };
    constructor(props) {
      super(props)
      // TODO: Offer redux option in future
      this.state =  { Modules: null }
    }
    render() {
      const { Modules } = this.state
      if(!Modules)
        return <Spinner />

      const { renderFactory, moduleProps } = this.props

      const Module = renderFactory(Modules)
      return <Module {...moduleProps} />
    }
    componentWillMount() {
      const { transpiler, meta, depCache, universalImports, renderFactory } = this.props
      //System.config({ transpiler, meta, depCache })

      const browserImports = IS_BROWSER ? this.props.browserImports : {}
      const serverImports = IS_BROWSER ? {} : this.props.serverImports

      const imports = { ...universalImports, ...serverImports, ...browserImports }
      //const imports = Array.from(new Set([ ...importsUniversal, ...(IS_BROWSER ? [] : importsServer), ...(IS_BROWSER ? importsBrowser : []) ]))
      console.warn('IMPORTS', imports)

      Promise.all(Object.keys(imports)
                        .map(x => System.import(imports[x])
                                        .then(Module => ({ [x]: Module }))
                            ))
              .then(modules => this.setState({ Modules: modules.reduce((Modules, Module) => ({ ...Modules, ...Module }), {})
                                              }))
    }
  }
}
