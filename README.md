# swift-kick
Command line tool to ease Swift development

## Instructions

### Enum Equality

1. Copy your Swift enum declaration with associated values.
2. `pbpaste | node ./ enum:eq | pbcopy`
3. Paste.

### Enum [JSON parsing and serialization](https://github.com/BurntCaramel/JSON)

1. Copy your Swift enum declaration with associated values.
2. `pbpaste | node ./ enum:json | pbcopy`
3. Paste.

## Example

```swift
// Example enum:

public enum ContentReference {
	case localSHA256(sha256: String, contentType: ContentType)
	case remote(url: NSURL, contentType: ContentType)
	case collected1(host: String, account: String, id: String, contentType: ContentType)
}
```

```swift
// pbpaste | node ./ enum:eq | pbcopy

public func == (lhs: ContentReference, rhs: ContentReference) {
	switch (lhs, rhs) {
	case let (.localSHA256(l), .localSHA256(r)):
		return l.sha256 == r.sha256 && l.contentType == r.contentType
	case let (.remote(l), .remote(r)):
		return l.url == r.url && l.contentType == r.contentType
	case let (.collected1(l), .collected1(r)):
		return l.host == r.host && l.account == r.account && l.id == r.id && l.contentType == r.contentType
	}
}
```

```swift
// pbpaste | node ./ enum:json | pbcopy

extension ContentReference {
	public enum Kind : String, KindType {
		case localSHA256 = "localSHA256"
		case remote = "remote"
		case collected1 = "collected1"
	}

	public var kind: Kind {
		switch self {
		case .localSHA256: return .localSHA256
		case .remote: return .remote
		case .collected1: return .collected1
		}
	}
}

extension ContentReference : JSONObjectRepresentable {
	public init(source: JSONObjectDecoder) throws {
		let type: Kind = try source.decode("type")
		switch type {
		case .localSHA256:
			self = try .localSHA256(
				sha256: source.decode("sha256"),
				contentType: source.decode("contentType")
			)
		case .remote:
			self = try .remote(
				url: source.decodeURL("url"),
				contentType: source.decode("contentType")
			)
		case .collected1:
			self = try .collected1(
				host: source.decode("host"),
				account: source.decode("account"),
				id: source.decode("id"),
				contentType: source.decode("contentType")
			)
		}
	}

	public func toJSON() -> JSON {
		switch self {
		case let .localSHA256(sha256, contentType):
			return .ObjectValue([
				"type": Kind.localSHA256.toJSON(),
				"sha256": sha256.toJSON(),
				"contentType": contentType.toJSON()
			])
		case let .remote(url, contentType):
			return .ObjectValue([
				"type": Kind.remote.toJSON(),
				"url": url.toJSON(),
				"contentType": contentType.toJSON()
			])
		case let .collected1(host, account, id, contentType):
			return .ObjectValue([
				"type": Kind.collected1.toJSON(),
				"host": host.toJSON(),
				"account": account.toJSON(),
				"id": id.toJSON(),
				"contentType": contentType.toJSON()
			])
		}
	}
}
```
