import Promise from 'bluebird'
import System from 'systemjs'
import createSpinner from './components/createSpinner'

export default React => {
  const { Component, PropTypes } = React
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
                                  , '*.js': { babelOptions: { presets:  [ 'react'
                                                                        , 'es2015'
                                                                        , 'stage-0'
                                                                        ]
                                                            , plugins: [ 'babel-plugin-transform-react-jsx' ]
                                                            }
                                            }
                                  }
                          , universalImports: {}
                          , serverImports: {}
                          , browserImports: {}
                          , renderFactory: Modules => props => {
                              const names = Object.keys(Modules)
                              if(names.length === 0)
                                return <div style={{ color: '#f00' }}>No module specified to load.</div>
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
      System.config({ transpiler, meta, depCache })

      const browserImports = IS_BROWSER ? this.props.browserImports : {}
      const serverImports = IS_BROWSER ? {} : this.props.serverImports

      const imports = { ...universalImports, ...serverImports, ...browserImports }
      //const imports = Array.from(new Set([ ...importsUniversal, ...(IS_BROWSER ? [] : importsServer), ...(IS_BROWSER ? importsBrowser : []) ]))
      console.warn('IMPORTS', imports)

      Promise.all(Object.keys(imports)
                        .map(x => System.import(x))
                        .then(Module => ({ [x]: Module })))
              .then(modules => this.setState({ Modules: modules.reduce((Modules, Module) => ({ ...Modules, ...Module }), {})
                                              }))
    }
  }
}
