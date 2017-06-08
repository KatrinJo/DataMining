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
  def __init__(self, nameValue, numOccur, parentNode):
    self.name = nameValue
    self.count = numOccur
    self.nodeLink = None
    self.parent = parentNode
    self.children = {} 
  def inc(self, numOccur):
    self.count += numOccur

def createTree(dataSet, minSup=1): # 根据数据集创建FPTree，未进行挖掘
  headerTable = {} # 频繁项表头项目
  # 遍历两次数据集
  for trans in dataSet: # 第一遍遍历计算频数：统计所有项的支持度并记入频繁项表头项目表
    for item in trans:
      headerTable[item] = headerTable.get(item, 0) + dataSet[trans]

  for k in list(headerTable):  # 将低于阈值的项删除
    if headerTable[k] < minSup: 
      del(headerTable[k])
  freqItemSet = set(headerTable.keys()) # 频繁项集
  if len(freqItemSet) == 0: 
    return None, None  # 如果频繁项集为空，返回
  for k in headerTable:
    headerTable[k] = [headerTable[k], None] # 格式化表头
  retTree = treeNode('Root', 1, None) # 创建树

  for tranSet, count in dataSet.items():  # 第二遍遍历计算频数：对各个交易按照支持度排序并构建FP树
    localD = {}
    for item in tranSet:  # 交易项有序化
      if item in freqItemSet:
        localD[item] = headerTable[item][0]
    if len(localD) > 0:
      orderedItems = [v[0] for v in sorted(localD.items(), key=lambda p: p[1], reverse=True)]
      updateTree(orderedItems, retTree, headerTable, count) # 用有序的频度项集填充树
  return retTree, headerTable # 返回树与表头

def updateTree(items, inTree, headerTable, count):
  if items[0] in inTree.children: # 检查有序频度项集的第一项是否存在在inTree.children
    inTree.children[items[0]].inc(count) 
  else:   # 将有序频度项集的第一项加入到inTree.children
    inTree.children[items[0]] = treeNode(items[0], count, inTree)
    if headerTable[items[0]][1] == None: # 更新头表 
      headerTable[items[0]][1] = inTree.children[items[0]]
    else:
      updateHeader(headerTable[items[0]][1], inTree.children[items[0]])
  if len(items) > 1: # 用剩下的有序项集更新树
    updateTree(items[1::], inTree.children[items[0]], headerTable, count)

def updateHeader(nodeToTest, targetNode):   
  while (nodeToTest.nodeLink != None):   
    nodeToTest = nodeToTest.nodeLink
  nodeToTest.nodeLink = targetNode

def ascendTree(leafNode, prefixPath): # 从该结点向上遍历路径，构建带有最小支持度的条件模式基
  if leafNode.parent != None:
    prefixPath.append(leafNode.name)
    ascendTree(leafNode.parent, prefixPath)
    
def findPrefixPath(basePat, treeNode): # 找到前缀路径 - 频繁项集的前缀也是频繁项集
  condPats = {}
  while treeNode != None:
    prefixPath = []
    ascendTree(treeNode, prefixPath)
    if len(prefixPath) > 1: 
      condPats[frozenset(prefixPath[1:])] = treeNode.count # frozenset：是冻结的集合，它是不可变的，一旦创建便不能更改，没有add，remove方法；存在哈希值，可以作为字典的key，也可以作为其它集合的元素。
    treeNode = treeNode.nodeLink
  return condPats

def mineTree(inTree, headerTable, minSup, preFix, freqItemList):
  bigL = [v[0] for v in sorted(headerTable.items(), key=lambda p: p[1][0])] # 排序
  for basePat in bigL:  # 从表头的底部开始
    newFreqSet = preFix.copy()
    newFreqSet.add(basePat)
    freqItemList.append(newFreqSet) # 频繁项集
    condPattBases = findPrefixPath(basePat, headerTable[basePat][1])
    # 从条件模式基中构建条件FPTree
    myCondTree, myHead = createTree(condPattBases, minSup)
    str_json = json.dumps(myHead,cls=MyEncoder,indent=2)

    if myHead != None: # 挖掘条件FPTree
      str_json = json.dumps(myCondTree,cls=MyEncoder,indent=2)
      mineTree(myCondTree, myHead, minSup, newFreqSet, freqItemList)


def loadSimpDat():
  argvCount = len(sys.argv)
  pathFile = "uploads"
  fileName = sys.argv[1] 
              # 'htv.csv' 
              # "project1and2 - bank-full.csv" 

  '''
  data.clip():修剪
  '''
  data = pd.read_csv(fileName, dtype=str)
  attr = data.columns # 属性
  attrCount = len(attr) # 属性个数
  attrType = data.dtypes # 记录属性的类别
  attrCov = data.cov() # 计算属性之间的协方差矩阵
  attrCorr = data.corr() # 计算属性之间的协方差系数矩阵
  attrBlock = data.as_blocks() # 将数据根据type分出来
  attrMatrix = data.as_matrix()

  return attrMatrix

def createInitSet(dataSet):
  retDict = {}
  for trans in dataSet:
    retDict[frozenset(trans)] = 1
  return retDict


def main():
    simpDat = loadSimpDat()
    minSup = int(float(sys.argv[2])/100*len(simpDat))
    initSet = createInitSet(simpDat)
    myFP, myHeadTable = createTree(initSet,minSup)
    freqItems = []
    mineTree(myFP,myHeadTable,minSup,set([]),freqItems)
    print(freqItems)
    print(len(freqItems))
if __name__ == '__main__':
  main()


