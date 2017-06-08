# coding: utf-8
from __future__ import print_function
import sys
import os
import io
import math
import codecs
import string
import shutil
import csv
import pandas as pd
import json
from json import JSONEncoder

class MyEncoder(JSONEncoder): # 将数据转为json格式传到js中进行处理
  def default(self, obj):
    if isinstance(obj, treeNode):
      return {'name':str(obj.name)+'->'+str(obj.count), 'children':obj.children.values()}
    return json.JSONEncoder.default(self, obj)

'''主要代码'''
class treeNode:
  def __init__(self, name_value, count_occur, parent_node):
    self.name = name_value
    self.count = count_occur
    self.nodeLink = None
    self.parent = parent_node
    self.children = {} 
  def inc(self, count_occur):
    self.count += count_occur

def createTree(data_set, min_support=1): # 根据数据集创建FPTree，未进行挖掘
  header_table = {} # 频繁项表头项目
  # 遍历两次数据集
  for trans in data_set: # 第一遍遍历计算频数：统计所有项的支持度并记入频繁项表头项目表
    for item in trans:
      header_table[item] = header_table.get(item, 0) + data_set[trans]

  for k in list(header_table):  # 将低于阈值的项删除
    if header_table[k] < min_support: 
      del(header_table[k])
  freq_item_set = set(header_table.keys()) # 频繁项集
  if len(freq_item_set) == 0: 
    return None, None  # 如果频繁项集为空，返回
  for k in header_table:
    header_table[k] = [header_table[k], None] # 格式化表头
  ret_tree = treeNode('Root', 1, None) # 创建树

  for tran_set, count in data_set.items():  # 第二遍遍历计算频数：对各个交易按照支持度排序并构建FP树
    localD = {}
    for item in tran_set:  # 交易项有序化
      if item in freq_item_set:
        localD[item] = header_table[item][0]
    if len(localD) > 0:
      ordered_items = [v[0] for v in sorted(localD.items(), key=lambda p: p[1], reverse=True)]
      updateTree(ordered_items, ret_tree, header_table, count) # 用有序的频度项集填充树
  return ret_tree, header_table # 返回树与表头

def updateTree(items, inTree, header_table, count):
  if items[0] in inTree.children: # 检查有序频度项集的第一项是否存在在inTree.children
    inTree.children[items[0]].inc(count) 
  else:   # 将有序频度项集的第一项加入到inTree.children
    inTree.children[items[0]] = treeNode(items[0], count, inTree)
    if header_table[items[0]][1] == None: # 更新头表 
      header_table[items[0]][1] = inTree.children[items[0]]
    else:
      updateHeader(header_table[items[0]][1], inTree.children[items[0]])
  if len(items) > 1: # 用剩下的有序项集更新树
    updateTree(items[1::], inTree.children[items[0]], header_table, count)

def updateHeader(node_to_test, target_node):   
  while (node_to_test.nodeLink != None):   
    node_to_test = node_to_test.nodeLink
  node_to_test.nodeLink = target_node

def ascendTree(leaf_node, pre_path): # 从该结点向上遍历路径，构建带有最小支持度的条件模式基
  if leaf_node.parent != None:
    pre_path.append(leaf_node.name)
    ascendTree(leaf_node.parent, pre_path)
    
def findprefixPath(base_pat, tree_node): # 找到前缀路径 - 频繁项集的前缀也是频繁项集
  condition_patterns = {}
  while tree_node != None:
    pre_path = []
    ascendTree(tree_node, pre_path)
    if len(pre_path) > 1: 
      condition_patterns[frozenset(pre_path[1:])] = tree_node.count # frozenset：是冻结的集合，它是不可变的，一旦创建便不能更改，没有add，remove方法；存在哈希值，可以作为字典的key，也可以作为其它集合的元素。
    tree_node = tree_node.nodeLink
  return condition_patterns

def mineTree(inTree, header_table, min_support, pre, freq_item_list):
  bigL = [v[0] for v in sorted(header_table.items(), key=lambda p: p[1][0])] # 排序
  for base_pat in bigL:  # 有序项中的基模式
    new_freq_set = pre.copy()
    new_freq_set.add(base_pat)
    freq_item_list.append(new_freq_set) # 频繁项集
    condition_pattern_bases = findprefixPath(base_pat, header_table[base_pat][1])
    # 从条件模式基中构建条件FPTree
    my_condition_tree, my_head = createTree(condition_pattern_bases, min_support)
    str_json = json.dumps(my_head,cls=MyEncoder,indent=2)

    if my_head != None: # 挖掘条件FPTree
      str_json = json.dumps(my_condition_tree,cls=MyEncoder,indent=2)
      mineTree(my_condition_tree, my_head, min_support, new_freq_set, freq_item_list)


def loadSimpDat():
  argv_count = len(sys.argv)
  path_file = "uploads"
  file_name = sys.argv[1] 
              # 'htv.csv' 
              # "project1and2 - bank-full.csv" 

  '''
  data.clip():修剪
  '''
  data = pd.read_csv(file_name, dtype=str)
  attr = data.columns # 属性
  # attrCount = len(attr) # 属性个数
  # attrType = data.dtypes # 记录属性的类别
  # attrCov = data.cov() # 计算属性之间的协方差矩阵
  # attrCorr = data.corr() # 计算属性之间的协方差系数矩阵
  # attrBlock = data.as_blocks() # 将数据根据type分出来
  attr_matrix = data.as_matrix()

  return attr_matrix

def createInitSet(data_set):
  ret_dict = {}
  for trans in data_set:
    ret_dict[frozenset(trans)] = 1
  return ret_dict


def main():
    simple_data = loadSimpDat()
    min_support = int(float(sys.argv[2])/100*len(simple_data))
    init_set = createInitSet(simple_data)
    myFP, my_headTable = createTree(init_set,min_support)
    freq_items = []
    mineTree(myFP,my_headTable,min_support,set([]),freq_items)
    print(freq_items)
    print(len(freq_items))
if __name__ == '__main__':
  main()


