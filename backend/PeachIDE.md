---
title: PeachIDE
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# PeachIDE

Base URLs:

# Authentication

# Slides

## GET 获取评论以及所有子评论

GET /comment/{comment_id}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|comment_id|path|string| 是 |原始评论（不是回复）的comment_id|

> 返回示例

> 200 Response

```json
{
  "comment": {
    "comment_id": "string",
    "content": "string",
    "user_id": "string",
    "material_id": "string",
    "page": 0,
    "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
  },
  "replies": [
    {
      "comment_id": "string",
      "content": "string",
      "user_id": "string",
      "material_id": "string",
      "page": 0,
      "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» comment|[Comment](#schemacomment)|true|none||none|
|»» comment_id|string|true|none|评论 id|none|
|»» content|string|true|none|评论内容|none|
|»» user_id|string|true|none|发布评论用户 id|none|
|»» material_id|string|true|none|对应材料的 id|none|
|»» page|integer|true|none|显示在第几页上|none|
|»» ancestor_id|string(uuid)¦null|false|none||能够追溯到的最前面的回复的评论的id，如果不是回复，ancestor就是None|
|» replies|[[Comment](#schemacomment)]|true|none||所有子评论|
|»» comment_id|string|true|none|评论 id|none|
|»» content|string|true|none|评论内容|none|
|»» user_id|string|true|none|发布评论用户 id|none|
|»» material_id|string|true|none|对应材料的 id|none|
|»» page|integer|true|none|显示在第几页上|none|
|»» ancestor_id|string(uuid)¦null|false|none||能够追溯到的最前面的回复的评论的id，如果不是回复，ancestor就是None|

## POST 回复评论

POST /comment/{comment_id}

输入回复的内容，返回被回复的 comment 对象在回复成功后的状态

> Body 请求参数

```yaml
content: "{% mock 'csentence' %}"
material_id: ""
page: 0
ancestor_id: ""

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|comment_id|path|string| 是 |none|
|body|body|object| 否 |none|
|» content|body|string| 是 |回复的内容|
|» material_id|body|string| 是 |none|
|» page|body|integer| 是 |none|
|» ancestor_id|body|string| 否 |如果是评论这里就是None，如果是回复那就是回复的评论的comment_id|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

*返回被回复的 comment 对象在回复成功后的状态*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|

## DELETE 删除评论

DELETE /comment/{comment_id}

删除 comment_id 对应的评论；仅能删除自己的评论，或者若是发布此材料的老师则可以删除任何评论

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|comment_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 获取材料内容

GET /material/{material_id}

返回一个 Material 对象

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|material_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "material_id": "string",
  "material_name": "string",
  "section_id": "string",
  "data": "string",
  "comments": [
    {
      "comment_id": "string",
      "content": "string",
      "user_id": "string",
      "material_id": "string",
      "page": 0,
      "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
    },
    {
      "comment_id": "string",
      "content": "string",
      "user_id": "string",
      "material_id": "string",
      "page": 0,
      "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» material_id|string|true|none|材料 id|none|
|» material_name|string|true|none|材料名字|none|
|» section_id|string|true|none|材料所对应的课程节的 id|none|
|» data|string|true|none|材料内容|none|
|» comments|[[Comment](#schemacomment)]|true|none|用户所添加的评论列表|只展示原始评论，不包括回复评论|
|»» comment_id|string|true|none|评论 id|none|
|»» content|string|true|none|评论内容|none|
|»» user_id|string|true|none|发布评论用户 id|none|
|»» material_id|string|true|none|对应材料的 id|none|
|»» page|integer|true|none|显示在第几页上|none|
|»» ancestor_id|string(uuid)¦null|false|none||能够追溯到的最前面的回复的评论的id，如果不是回复，ancestor就是None|

## POST 修改或添加材料内容 

POST /material/{material_id}

如果是修改，不需要传所有的参数，改什么传什么就行，然后不能改评论，如果是新增的话评论就是空，但是需要传所有参数，返回一个 修改后的 Material 对象

> Body 请求参数

```yaml
material_name: ""
section_id: ""
data: ""

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|material_id|path|string| 是 |none|
|body|body|object| 否 |none|
|» material_name|body|string| 否 |none|
|» section_id|body|string| 否 |none|
|» data|body|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "material_id": "string",
  "material_name": "string",
  "section_id": "string",
  "data": "string",
  "comments": [
    {
      "comment_id": "string",
      "content": "string",
      "user_id": "string",
      "material_id": "string",
      "page": 0,
      "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
    },
    {
      "comment_id": "string",
      "content": "string",
      "user_id": "string",
      "material_id": "string",
      "page": 0,
      "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» material_id|string|true|none|材料 id|none|
|» material_name|string|true|none|材料名字|none|
|» section_id|string|true|none|材料所对应的课程节的 id|none|
|» data|string|true|none|材料内容|none|
|» comments|[[Comment](#schemacomment)]|true|none|用户所添加的评论列表|只展示原始评论，不包括回复评论|
|»» comment_id|string|true|none|评论 id|none|
|»» content|string|true|none|评论内容|none|
|»» user_id|string|true|none|发布评论用户 id|none|
|»» material_id|string|true|none|对应材料的 id|none|
|»» page|integer|true|none|显示在第几页上|none|
|»» ancestor_id|string(uuid)¦null|false|none||能够追溯到的最前面的回复的评论的id，如果不是回复，ancestor就是None|

## DELETE 删除材料

DELETE /material/{material_id}

通过id删除材料

> Body 请求参数

```yaml
{}

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|material_id|path|string| 是 |none|
|body|body|object| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 获取笔记

GET /note/{material_id}

获取当前用户在此材料处留存的笔记

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|material_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "note_id": "string",
  "user_id": "string",
  "material_id": "string",
  "content": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[Note](#schemanote)|

## POST 修改或添加笔记

POST /note/{note_id}

修改或新增当前用户在此材料处留存特定一条 Note 笔记；如果是修改，改哪些传哪些，如果是新增，所以字段都需要有

> Body 请求参数

```yaml
note_id: ""
material_id: ""
content: "{% mock 'cparagraph' %}"

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|note_id|path|string| 是 |none|
|body|body|object| 否 |none|
|» note_id|body|string| 否 |none|
|» material_id|body|string| 否 |none|
|» content|body|string| 否 |当前新笔记的 markdown 全文|

> 返回示例

> 200 Response

```json
{
  "note_id": "string",
  "user_id": "string",
  "material_id": "string",
  "content": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[Note](#schemanote)|

## DELETE 删除特定笔记 

DELETE /note/{note_id}

通过删除笔记

> Body 请求参数

```yaml
{}

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|note_id|path|string| 是 |none|
|body|body|object| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

*修改后的笔记对象*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|

## GET 获取代码片段列表

GET /snippet/{material_id}

获取在此材料中的所有 code snippets（与笔记列表不同，这里的 code snippets 是老师所指定的）

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|material_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "code_snippets": [
    {
      "snippet_id": "string",
      "user_id": "string",
      "material_id": "string",
      "lang": "string",
      "page": 0,
      "content": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    },
    {
      "snippet_id": "string",
      "user_id": "string",
      "material_id": "string",
      "lang": "string",
      "page": 0,
      "content": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    },
    {
      "snippet_id": "string",
      "user_id": "string",
      "material_id": "string",
      "lang": "string",
      "page": 0,
      "content": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    },
    {
      "snippet_id": "string",
      "user_id": "string",
      "material_id": "string",
      "lang": "string",
      "page": 0,
      "content": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    },
    {
      "snippet_id": "string",
      "user_id": "string",
      "material_id": "string",
      "lang": "string",
      "page": 0,
      "content": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    },
    {
      "snippet_id": "string",
      "user_id": "string",
      "material_id": "string",
      "lang": "string",
      "page": 0,
      "content": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    },
    {
      "snippet_id": "string",
      "user_id": "string",
      "material_id": "string",
      "lang": "string",
      "page": 0,
      "content": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    },
    {
      "snippet_id": "string",
      "user_id": "string",
      "material_id": "string",
      "lang": "string",
      "page": 0,
      "content": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    },
    {
      "snippet_id": "string",
      "user_id": "string",
      "material_id": "string",
      "lang": "string",
      "page": 0,
      "content": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    },
    {
      "snippet_id": "string",
      "user_id": "string",
      "material_id": "string",
      "lang": "string",
      "page": 0,
      "content": "string",
      "position": {
        "x": 0,
        "y": 0
      }
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» code_snippets|[[CodeSnippet](#schemacodesnippet)]|true|none||none|
|»» snippet_id|string|true|none|Snippet 的 id|none|
|»» user_id|string|false|none|此 snippet 副本对应的 user_id|留空意味着是原版本|
|»» material_id|string|true|none|从属于材料的 id|none|
|»» lang|string|true|none|Snippet 的编程语言|none|
|»» page|integer|true|none|所属于的页面|none|
|»» content|string|true|none|原始的内容|none|
|»» position|[Position](#schemaposition)|true|none|坐标|none|
|»»» x|number|true|none|X 坐标|none|
|»»» y|number|true|none|Y 坐标|none|

状态码 **404**

*当前用户没有在此页面留下 code snippet 记录*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[CodeSnippet](#schemacodesnippet)]|false|none||当前用户没有在此页面留下 code snippet 记录|
|» snippet_id|string|true|none|Snippet 的 id|none|
|» user_id|string|false|none|此 snippet 副本对应的 user_id|留空意味着是原版本|
|» material_id|string|true|none|从属于材料的 id|none|
|» lang|string|true|none|Snippet 的编程语言|none|
|» page|integer|true|none|所属于的页面|none|
|» content|string|true|none|原始的内容|none|
|» position|[Position](#schemaposition)|true|none|坐标|none|
|»» x|number|true|none|X 坐标|none|
|»» y|number|true|none|Y 坐标|none|

## GET 执行代码片段

GET /execute/snippet/{snippet_id}

执行当前用户对应的 snippet 的副本的内容

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|snippet_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "result": "string",
  "error": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|
|404|[Not Found](https://tools.ietf.org/html/rfc7231#section-6.5.4)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» result|string|true|none|返回的结果|none|
|» error|string¦null|false|none|返回的报错，若无则留空|none|

状态码 **404**

*当前用户没有在此页面留下 code snippet 记录*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|

## POST 修改或增加代码片段

POST /snippet/{material_id}/page/{page}

为某一页面修改或增加预设代码片段，返回所增加的代码片段；
此 API 对老师和学生造成不同的结果：老师修改，将改变此 snippet 原本内容，并且可以增加代码片段；
如果学生修改，将改变自己的 snippet 副本内容，并且无法增加代码片段

> Body 请求参数

```yaml
snippet_id: ""
lang: ""
content: "{% mock 'string' %}"
position_x: 0
position_y: 0

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|material_id|path|string| 是 |none|
|page|path|string| 是 |none|
|body|body|object| 否 |none|
|» snippet_id|body|string| 是 |none|
|» lang|body|string| 否 |none|
|» content|body|string| 是 |代码片段的内容|
|» position_x|body|integer| 否 |none|
|» position_y|body|integer| 否 |none|

> 返回示例

> 200 Response

```json
{
  "snippet_id": "string",
  "user_id": "string",
  "material_id": "string",
  "lang": "string",
  "page": 0,
  "content": "string",
  "position": {
    "x": 0,
    "y": 0
  }
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[CodeSnippet](#schemacodesnippet)|

## DELETE 老师删除代码片段 

DELETE /teacher/{snippet_id}

老师通过snippet_id删除某一个片段

> Body 请求参数

```yaml
{}

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|snippet_id|path|string| 是 |none|
|body|body|object| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 获取书签列表

GET /marklist/{material_id}

获取当前用户对应此材料添加的书签的列表

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|material_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "marklists": [
    {
      "list_id": "string",
      "material_id": "string",
      "user_id": "string",
      "page": 1,
      "bookmark_list": [
        23
      ]
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» marklists|[[BookmarkList](#schemabookmarklist)]|true|none||none|
|»» list_id|string|true|none|本 list 的 id|none|
|»» material_id|string|true|none|对应资料的 id|none|
|»» user_id|string|true|none|创建此 list 的用户 id|none|
|»» page|integer|true|none||none|
|»» bookmark_list|[integer]|true|none|全部书签的数组|none|

## POST 增加书签

POST /marklist/{list_id}/page/{page}

为当前用户为此材料的这一页添加书签，返回新的书签列表

> Body 请求参数

```yaml
list_id: ""
bookmark_list: ""

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|list_id|path|string| 是 |none|
|page|path|string| 是 |none|
|body|body|object| 否 |none|
|» list_id|body|string| 否 |none|
|» bookmark_list|body|string| 否 |是一个stringify的int列表|

> 返回示例

> 200 Response

```json
{
  "list_id": "string",
  "material_id": "string",
  "user_id": "string",
  "page": 1,
  "bookmark_list": [
    23
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[BookmarkList](#schemabookmarklist)|

## DELETE 删除书签

DELETE /marklist/{list_id}

根据list_id删除指定书签

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|list_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# Coding

## GET 获取文件目录信息

GET /environment/{environment_id}/files

获取某个根目录下的文件结构

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|environment_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "type": "directory",
  "uri": "file:///github/react-file-tree",
  "children": [
    {
      "type": "file",
      "uri": "file:///github/react-file-tree/.babelrc"
    },
    {
      "type": "directory",
      "uri": "file:///github/react-file-tree/.git",
      "children": [
        {
          "type": "file",
          "uri": "file:///github/react-file-tree/.git/config"
        },
        {
          "type": "file",
          "uri": "file:///github/react-file-tree/.git/description"
        },
        {
          "type": "directory",
          "uri": "file:///github/react-file-tree/.git/hooks",
          "children": [
            {
              "type": "file",
              "uri": "file:///github/react-file-tree/.git/hooks/update.sample"
            }
          ]
        },
        {
          "type": "file",
          "uri": "file:///github/react-file-tree/.git/index"
        },
        {
          "type": "file",
          "uri": "file:///github/react-file-tree/.git/packed-refs"
        }
      ]
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[TreeNode](#schematreenode)|

## GET 获取文件内容

GET /environment/{environment_id}/file

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|environment_id|path|string| 是 |none|
|path|query|string| 是 |none|

> 返回示例

> 200 Response

```
"const greeting = \"Hello, world!\"; console.log(greeting);"
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|string|

## PUT 修改文件目录

PUT /environment/{environment_id}/file

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|environment_id|path|string| 是 |none|
|origin|query|string| 否 |none|
|destination|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|none|Inline|

### 返回数据结构

## POST 创建新文件

POST /environment/{environment_id}/file

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|environment_id|path|string| 是 |none|
|uri|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## PUT 修改文件夹目录

PUT /environment/{environment_id}/directory

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|environment_id|path|string| 是 |none|
|origin|query|string| 否 |none|
|destination|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|
|400|[Bad Request](https://tools.ietf.org/html/rfc7231#section-6.5.1)|none|Inline|

### 返回数据结构

## POST 创建新文件夹

POST /environment/{environment_id}/directory

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|environment_id|path|string| 是 |none|
|uri|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 文件内容修改

POST /environment/{environment_id}/file/ot

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|environment_id|path|string| 是 |none|
|uri|query|string| 否 |none|
|ot_type|query|string| 否 |none|
|position|query|string| 否 |none|
|content|query|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 获取WebSocketUrl

GET /environment/{projectId}/collaboration/url

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|projectId|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "url": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» url|string|true|none||none|

## GET 获取保存的Layout信息

GET /environment/{projectId}/layout

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|projectId|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 保存Layout信息

POST /environment/{projectId}/layout

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|projectId|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# Classes (to Student)

## GET 获取课程section列表

GET /sections/{course_id}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|course_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "sections": [
    {
      "section_id": "",
      "name": "",
      "materials": [
        {
          "material_id": "",
          "material_name": ""
        }
      ]
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» sections|[object]|true|none||none|
|»» section_id|string|true|none|节 id|none|
|»» name|string|true|none|节的名称|none|
|»» materials|[object]|true|none|课程对应的材料|none|
|»»» material_id|string|true|none|材料 id|none|
|»»» material_name|string|true|none|材料名字|none|

## GET 获取用户关联课程

GET /courses

> 返回示例

> 200 Response

```json
{
  "courses": [
    {
      "course_id": "",
      "name": "",
      "number": "",
      "teachers_name": [
        ""
      ]
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» courses|[object]|true|none|课程列表|none|
|»» course_id|string|true|none|课程班级 id|none|
|»» name|string|true|none|课程名称|none|
|»» number|string|true|none|课程号码|e.g. CS209|
|»» teachers_name|[string]|true|none|授课老师们的名字|none|

## GET 获取具体课程信息

GET /course_info/{course_id}

根据course_id 获取这门课程的具体信息

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|course_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "course_id": "b20be0be-57f5-4db3-91ea-8a961c443134",
  "name": "手理什石还与只。",
  "number": "MF339",
  "description": "北动王必深。为铁六表果。式属铁候院选队农。何算切查立作位积物。管而集场北。",
  "schedules": [
    {
      "date": "2025-01-16",
      "section_name": "+HOP#gIQ\\H"
    },
    {
      "date": "2025-07-19",
      "section_name": "wIp8WX)l;S"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» course_id|string|true|none|课程班级 id|none|
|» name|string|true|none|课程名称|none|
|» number|string|true|none|课程号码|e.g. CS209|
|» description|string|true|none|课程描述|none|
|» schedules|[object]|true|none|上课日期列表|none|
|»» date|string|true|none|该日期有课程|none|
|»» section_name|string|true|none|当天课程的section|none|

## GET 获取教师列表信息

GET /instructors/{classes_id}

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|classes_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "teachers": [
    {
      "name": "",
      "photo": "",
      "office_hour": "",
      "office_place": ""
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

*dde*

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» teachers|[object]|true|none||none|
|»» name|string|true|none|用户姓名|名称|
|»» photo|string|true|none|老师会有一个头像|none|
|»» office_hour|string|true|none||none|
|»» office_place|string|true|none||none|

## GET 获取作业列表

GET /assignments/{course_id}/

根据course_id,查询这个course对应的所有Assignments

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|course_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "assignments": [
    {
      "assignment_id": "",
      "name": "",
      "deadline": "",
      "isOver": null
    },
    {
      "assignment_id": "",
      "name": "",
      "deadline": "",
      "isOver": null
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» assignments|[object]|true|none||none|
|»» assignment_id|string|true|none|作业id|none|
|»» name|string|true|none|作业名|none|
|»» deadline|string|true|none|作业ddl|none|
|»» isOver|boolean|true|none|作业是否截止|none|

## GET 显示日历（还没写完）

GET /classes/calendar

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## POST 创建或修改课程信息

POST /course_info

添加课程
teacher_id, sections, schedules, assignments这4个字段都通过打包成字符串
类似于[teacher_id1, teacher_id2] [assignment_id1, assignment_id2]

> Body 请求参数

```yaml
course_id: ""
name: ""
description: ""
number: ""
teacher_id: ""
sections: ""
schedules: ""
assignments: ""

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» course_id|body|string| 否 |none|
|» name|body|string| 否 |none|
|» description|body|string| 否 |none|
|» number|body|string| 否 |none|
|» teacher_id|body|[string]| 否 |none|
|» sections|body|[string]| 否 |none|
|» schedules|body|[string]| 否 |none|
|» assignments|body|[string]| 否 |none|

> 返回示例

> 200 Response

```json
{
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» message|string|true|none||none|

## POST 创建或者修改section

POST /sections

添加或者修改section
materials,schedules这2个字段都通过打包成字符串
类似于[material_id1, material_id2] [schedule_id1, schedule_id2]

> Body 请求参数

```yaml
section_id: ""
course_id: ""
name: ""
materials: ""
schedules: ""

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» section_id|body|string| 否 |none|
|» course_id|body|string| 否 |none|
|» name|body|string| 否 |none|
|» materials|body|[string]| 否 |none|
|» schedules|body|[string]| 否 |none|

> 返回示例

> 200 Response

```json
{
  "message": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» message|string|true|none||none|

# Classes (to Teacher)

## POST 将学生加入某个课程

POST /add

> Body 请求参数

```yaml
user_id: ""
course_id: ""

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» user_id|body|string| 否 |none|
|» course_id|body|string| 否 |none|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

# General

## GET 获取用户对应基本信息

GET /user/{user_id}

输入一个用户 id ，输出此用户对应信息

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|user_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "user_id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "is_teacher": true,
  "courses": [
    {
      "course_id": "string"
    }
  ],
  "photo": "string",
  "office_hour": "string",
  "office_place": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[User](#schemauser)|

## GET 获取当前用户信息

GET /user

输入一个用户 id ，输出此用户对应信息

> 返回示例

> 200 Response

```json
{
  "user_id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "is_teacher": true,
  "courses": [
    {
      "course_id": "string"
    }
  ],
  "photo": "string",
  "office_hour": "string",
  "office_place": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[User](#schemauser)|

## POST 用户登陆

POST /login

> Body 请求参数

```yaml
name: ""
password: ""

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» name|body|string| 否 |none|
|» password|body|string| 否 |none|

> 返回示例

> 200 Response

```json
{
  "token": "string",
  "user_id": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» token|string|true|none||none|
|» user_id|string|true|none||none|

## POST 用户注册

POST /register

> Body 请求参数

```yaml
name: 王卓
password: wangzhuo
email: 12210532@mail.sustech.edu.cn
user_id: "12210532"

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|body|body|object| 否 |none|
|» name|body|string| 否 |用户名（姓名）|
|» password|body|string| 否 |密码|
|» email|body|string| 否 |邮箱|
|» user_id|body|string| 否 |学号|

> 返回示例

> 200 Response

```json
{
  "msg": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» msg|string|true|none||none|

## GET 获取用户Sidebar目录

GET /sidebar

> 返回示例

> 200 Response

```json
[
  {
    "title": "string",
    "url": "string",
    "type": "string"
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|*anonymous*|[[SideBarItem](#schemasidebaritem)]|false|none||none|
|» title|string|true|none||none|
|» url|string|true|none||路由路径|
|» type|string|true|none||"coding" | "slides" | "classes" | "home"|

# AI

## POST 新建 AI 对话

POST /chat

返回新建的 chat id

> 返回示例

> 200 Response

```json
{
  "chat_id": "string"
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» chat_id|string|true|none|新建的 Chat ID|none|

## GET 获取 AI 对话列表

GET /chat

返回现有的对话列表

> 返回示例

> 200 Response

```json
[
  {
    "chat_id": "string",
    "title": "string"
  }
]
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

状态码 **200**

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|» chat_id|string|true|none|对话对应的 ID|none|
|» title|string|true|none|对应的标题|none|

## POST 发送消息

POST /chat/{chat_id}

发送一条消息，返回一条消息流

> Body 请求参数

```yaml
message: ""
material_id: "{{$string.uuid}}"

```

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|chat_id|path|string| 是 |none|
|body|body|object| 否 |none|
|» message|body|string| 是 |none|
|» material_id|body|string| 否 |所添加的文件的对应 Material ID|

> 返回示例

> 200 Response

```json
{}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### 返回数据结构

## GET 获取 AI 对话内容

GET /chat/{chat_id}

返回现有的对话列表

### 请求参数

|名称|位置|类型|必选|说明|
|---|---|---|---|---|
|chat_id|path|string| 是 |none|

> 返回示例

> 200 Response

```json
{
  "chat_id": "string",
  "user_id": "string",
  "material_id": "string",
  "title": "string",
  "messages": [
    {
      "role": "string",
      "content": "string"
    }
  ]
}
```

### 返回结果

|状态码|状态码含义|说明|数据模型|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|[Chat](#schemachat)|

# 数据模型

<h2 id="tocS_Assignment">Assignment</h2>

<a id="schemaassignment"></a>
<a id="schema_Assignment"></a>
<a id="tocSassignment"></a>
<a id="tocsassignment"></a>

```json
{
  "assignment_id": "string",
  "name": "string",
  "course_id": "string",
  "teacher_id": "string",
  "deadline": "string",
  "isOver": true,
  "materials": [
    {
      "material_id": "string",
      "material_name": "string",
      "section_id": "string",
      "data": "string",
      "comments": [
        {
          "comment_id": "string",
          "content": "string",
          "user_id": "string",
          "material_id": "string",
          "page": 0,
          "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
        },
        {
          "comment_id": "string",
          "content": "string",
          "user_id": "string",
          "material_id": "string",
          "page": 0,
          "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
        }
      ]
    }
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|assignment_id|string|true|none|作业id|none|
|name|string|true|none|作业名|none|
|course_id|string|true|none|关联的课程的id|none|
|teacher_id|string|true|none|布置作业的老师id|none|
|deadline|string|true|none|作业ddl|none|
|isOver|boolean|true|none|作业是否截止|none|
|materials|[object]|true|none|材料列表|none|
|» material_id|string|true|none|材料 id|none|
|» material_name|string|true|none|材料名字|none|
|» section_id|string|true|none|材料所对应的课程节的 id|none|
|» data|string|true|none|材料内容|none|
|» comments|[[Comment](#schemacomment)]|true|none|用户所添加的评论列表|只展示原始评论，不包括回复评论|

<h2 id="tocS_BookmarkList">BookmarkList</h2>

<a id="schemabookmarklist"></a>
<a id="schema_BookmarkList"></a>
<a id="tocSbookmarklist"></a>
<a id="tocsbookmarklist"></a>

```json
{
  "list_id": "string",
  "material_id": "string",
  "user_id": "string",
  "page": 1,
  "bookmark_list": [
    23
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|list_id|string|true|none|本 list 的 id|none|
|material_id|string|true|none|对应资料的 id|none|
|user_id|string|true|none|创建此 list 的用户 id|none|
|page|integer|true|none||none|
|bookmark_list|[integer]|true|none|全部书签的数组|none|

<h2 id="tocS_CodeSnippet">CodeSnippet</h2>

<a id="schemacodesnippet"></a>
<a id="schema_CodeSnippet"></a>
<a id="tocScodesnippet"></a>
<a id="tocscodesnippet"></a>

```json
{
  "snippet_id": "string",
  "user_id": "string",
  "material_id": "string",
  "lang": "string",
  "page": 0,
  "content": "string",
  "position": {
    "x": 0,
    "y": 0
  }
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|snippet_id|string|true|none|Snippet 的 id|none|
|user_id|string|false|none|此 snippet 副本对应的 user_id|留空意味着是原版本|
|material_id|string|true|none|从属于材料的 id|none|
|lang|string|true|none|Snippet 的编程语言|none|
|page|integer|true|none|所属于的页面|none|
|content|string|true|none|原始的内容|none|
|position|[Position](#schemaposition)|true|none|坐标|none|

<h2 id="tocS_Comment">Comment</h2>

<a id="schemacomment"></a>
<a id="schema_Comment"></a>
<a id="tocScomment"></a>
<a id="tocscomment"></a>

```json
{
  "comment_id": "string",
  "content": "string",
  "user_id": "string",
  "material_id": "string",
  "page": 0,
  "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|comment_id|string|true|none|评论 id|none|
|content|string|true|none|评论内容|none|
|user_id|string|true|none|发布评论用户 id|none|
|material_id|string|true|none|对应材料的 id|none|
|page|integer|true|none|显示在第几页上|none|
|ancestor_id|string(uuid)¦null|false|none||能够追溯到的最前面的回复的评论的id，如果不是回复，ancestor就是None|

<h2 id="tocS_Course">Course</h2>

<a id="schemacourse"></a>
<a id="schema_Course"></a>
<a id="tocScourse"></a>
<a id="tocscourse"></a>

```json
{
  "course_id": "string",
  "name": "string",
  "description": "string",
  "number": "string",
  "teacher_id": [
    "string"
  ],
  "sections": [
    {
      "section_id": "string",
      "course_id": "string",
      "name": "string",
      "materials": [
        {
          "material_id": "string",
          "material_name": "string",
          "section_id": "string",
          "data": "string",
          "comments": [
            {},
            {}
          ]
        }
      ],
      "schedules": [
        {
          "schedule_id": "string",
          "date": "string",
          "section_name": "string"
        }
      ]
    }
  ],
  "schedules": [
    {
      "schedule_id": "string",
      "date": "string",
      "section_name": "string"
    }
  ],
  "assignments": [
    {
      "assignment_id": "string",
      "name": "string",
      "course_id": "string",
      "teacher_id": "string",
      "deadline": "string",
      "isOver": true,
      "materials": [
        {
          "material_id": "string",
          "material_name": "string",
          "section_id": "string",
          "data": "string",
          "comments": [
            {},
            {}
          ]
        }
      ]
    }
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|course_id|string|true|none|课程班级 id|none|
|name|string|true|none|课程名称|none|
|description|string|true|none|课程描述|none|
|number|string|true|none|课程号码|e.g. CS209|
|teacher_id|[string]|true|none|授课老师列表|none|
|sections|[[Section](#schemasection)]|true|none|课程对应的小节列表|none|
|schedules|[[Schedule](#schemaschedule)]|true|none|上课日期列表|none|
|assignments|[[Assignment](#schemaassignment)]|true|none|作业列表|none|

<h2 id="tocS_Material">Material</h2>

<a id="schemamaterial"></a>
<a id="schema_Material"></a>
<a id="tocSmaterial"></a>
<a id="tocsmaterial"></a>

```json
{
  "material_id": "string",
  "material_name": "string",
  "section_id": "string",
  "data": "string",
  "comments": [
    {
      "comment_id": "string",
      "content": "string",
      "user_id": "string",
      "material_id": "string",
      "page": 0,
      "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
    },
    {
      "comment_id": "string",
      "content": "string",
      "user_id": "string",
      "material_id": "string",
      "page": 0,
      "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
    }
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|material_id|string|true|none|材料 id|none|
|material_name|string|true|none|材料名字|none|
|section_id|string|true|none|材料所对应的课程节的 id|none|
|data|string|true|none|材料内容|none|
|comments|[[Comment](#schemacomment)]|true|none|用户所添加的评论列表|只展示原始评论，不包括回复评论|

<h2 id="tocS_Note">Note</h2>

<a id="schemanote"></a>
<a id="schema_Note"></a>
<a id="tocSnote"></a>
<a id="tocsnote"></a>

```json
{
  "note_id": "string",
  "user_id": "string",
  "material_id": "string",
  "content": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|note_id|string|true|none|笔记本身的 id|none|
|user_id|string|true|none|作者用户的 id|none|
|material_id|string|true|none|对应的材料的 id|none|
|content|string|true|none|笔记原文|none|

<h2 id="tocS_Schedule">Schedule</h2>

<a id="schemaschedule"></a>
<a id="schema_Schedule"></a>
<a id="tocSschedule"></a>
<a id="tocsschedule"></a>

```json
{
  "schedule_id": "string",
  "date": "string",
  "section_name": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|schedule_id|string|true|none||none|
|date|string|true|none||none|
|section_name|string|true|none||none|

<h2 id="tocS_Section">Section</h2>

<a id="schemasection"></a>
<a id="schema_Section"></a>
<a id="tocSsection"></a>
<a id="tocssection"></a>

```json
{
  "section_id": "string",
  "course_id": "string",
  "name": "string",
  "materials": [
    {
      "material_id": "string",
      "material_name": "string",
      "section_id": "string",
      "data": "string",
      "comments": [
        {
          "comment_id": "string",
          "content": "string",
          "user_id": "string",
          "material_id": "string",
          "page": 0,
          "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
        },
        {
          "comment_id": "string",
          "content": "string",
          "user_id": "string",
          "material_id": "string",
          "page": 0,
          "ancestor_id": "2a40f5e0-a6f7-4263-bd7b-27dc66288060"
        }
      ]
    }
  ],
  "schedules": [
    {
      "schedule_id": "string",
      "date": "string",
      "section_name": "string"
    }
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|section_id|string|true|none|节 id|none|
|course_id|string|true|none|对应课程的 id|none|
|name|string|true|none|节的名称|none|
|materials|[[Material](#schemamaterial)]|true|none|课程对应的材料|none|
|schedules|[object]|true|none||none|
|» schedule_id|string|true|none||none|
|» date|string|true|none||none|
|» section_name|string|true|none||none|

<h2 id="tocS_User">User</h2>

<a id="schemauser"></a>
<a id="schema_User"></a>
<a id="tocSuser"></a>
<a id="tocsuser"></a>

```json
{
  "user_id": "string",
  "name": "string",
  "email": "string",
  "password": "string",
  "is_teacher": true,
  "courses": [
    {
      "course_id": "string"
    }
  ],
  "photo": "string",
  "office_hour": "string",
  "office_place": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|user_id|string|true|none|用户的工号|none|
|name|string|true|none|用户姓名|名称|
|email|string|true|none|（注册时可选）|none|
|password|string|true|none|用户密码加密后的结果|none|
|is_teacher|boolean|true|none|是否是教师|true 代表是教师|
|courses|[object]|true|none|用户关联的课程|none|
|» course_id|string|true|none|具体课程的id|none|
|photo|string|true|none|会有一个头像|none|
|office_hour|string|true|none||none|
|office_place|string|true|none||none|

<h2 id="tocS_Position">Position</h2>

<a id="schemaposition"></a>
<a id="schema_Position"></a>
<a id="tocSposition"></a>
<a id="tocsposition"></a>

```json
{
  "x": 0,
  "y": 0
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|x|number|true|none|X 坐标|none|
|y|number|true|none|Y 坐标|none|

<h2 id="tocS_TreeNode">TreeNode</h2>

<a id="schematreenode"></a>
<a id="schema_TreeNode"></a>
<a id="tocStreenode"></a>
<a id="tocstreenode"></a>

```json
{
  "type": "string",
  "uri": "string",
  "children": [
    {
      "type": "string",
      "uri": "string",
      "children": [
        {
          "type": "string",
          "uri": "string",
          "children": [
            {}
          ]
        }
      ]
    }
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|type|string|true|none||none|
|uri|string|true|none||none|
|children|[[TreeNode](#schematreenode)]¦null|false|none||none|

<h2 id="tocS_SideBarItem">SideBarItem</h2>

<a id="schemasidebaritem"></a>
<a id="schema_SideBarItem"></a>
<a id="tocSsidebaritem"></a>
<a id="tocssidebaritem"></a>

```json
{
  "title": "string",
  "url": "string",
  "type": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|title|string|true|none||none|
|url|string|true|none||路由路径|
|type|string|true|none||"coding" | "slides" | "classes" | "home"|

<h2 id="tocS_Chat">Chat</h2>

<a id="schemachat"></a>
<a id="schema_Chat"></a>
<a id="tocSchat"></a>
<a id="tocschat"></a>

```json
{
  "chat_id": "string",
  "user_id": "string",
  "material_id": "string",
  "title": "string",
  "messages": [
    {
      "role": "string",
      "content": "string"
    }
  ]
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|chat_id|string|true|none|对话对应的 ID|none|
|user_id|string|true|none|对话人的 ID|none|
|material_id|string¦null|false|none|所参考的 Material，可选|none|
|title|string|true|none|对话的简介|none|
|messages|[[Message](#schemamessage)]|true|none|对话的内容|none|

<h2 id="tocS_Message">Message</h2>

<a id="schemamessage"></a>
<a id="schema_Message"></a>
<a id="tocSmessage"></a>
<a id="tocsmessage"></a>

```json
{
  "role": "string",
  "content": "string"
}

```

### 属性

|名称|类型|必选|约束|中文名|说明|
|---|---|---|---|---|---|
|role|string|true|none|类型|none|
|content|string|true|none|内容|none|

