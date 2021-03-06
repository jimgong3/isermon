//
//  Sermon.swift
//  isermon
//
//  Created by jim on 12/12/2017.
//  Copyright © 2017年 jimgong. All rights reserved.
//

import Foundation

class Sermon {
    var id: String?
    var title: String
    var description: String?
    var speaker: String?
    var scripture: String?
    var info: String?
    var lang: String?
    var urlLocal: String?
    var urlSource: String?
    var username: String?
    var date: String?
    
    var num_listen: Int?
    var num_like: Int?
    var num_bookmark: Int?

    init?(title: String){
        self.title = title
    }
    
    init?(json: [String: Any]){
        self.id = json["_id"] as? String
        self.title = json["title"] as! String
        self.description = json["description"] as? String
        self.speaker = json["speaker"] as? String
        self.scripture = json["scripture"] as? String
        self.info = json["info"] as? String
        self.lang = json["lang"] as? String
        self.urlLocal = json["urlLocal"] as? String
        self.urlSource = json["urlSource"] as? String
        self.username = json["username"] as? String
        self.date = json["date"] as? String

        self.num_listen = json["num_listen"] as? Int
        self.num_like = json["num_like"] as? Int
        self.num_bookmark = json["num_bookmark"] as? Int
    }
}
