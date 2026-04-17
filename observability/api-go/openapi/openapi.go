package openapi

import (
	_ "embed"
	"encoding/json"

	"gopkg.in/yaml.v3"
)

//go:embed openapi.yaml
var specYAML []byte

// YAML returns the raw embedded spec bytes.
func YAML() []byte { return specYAML }

// JSON converts the embedded YAML to JSON.
func JSON() ([]byte, error) {
	var doc any
	if err := yaml.Unmarshal(specYAML, &doc); err != nil {
		return nil, err
	}
	doc = fixMapKeys(doc)
	return json.Marshal(doc)
}

// fixMapKeys recursively converts map[interface{}]interface{} (yaml.v2
// default) into map[string]interface{} so encoding/json can marshal it.
// yaml.v3 returns map[string]interface{} already, but we keep this for safety.
func fixMapKeys(in any) any {
	switch v := in.(type) {
	case map[any]any:
		out := map[string]any{}
		for k, val := range v {
			out[toString(k)] = fixMapKeys(val)
		}
		return out
	case []any:
		for i, x := range v {
			v[i] = fixMapKeys(x)
		}
		return v
	default:
		return in
	}
}

func toString(k any) string {
	switch v := k.(type) {
	case string:
		return v
	default:
		b, _ := json.Marshal(v)
		return string(b)
	}
}
